# Railway Deployment Guide

This guide provides step-by-step instructions for deploying the AR Report application with MySQL on Railway.

## What is Railway?

[Railway](https://railway.app) is a deployment platform that provides:
- Simple Git-based deployments
- Built-in database services (PostgreSQL, MySQL, Redis, MongoDB)
- Automatic HTTPS
- Environment variable management
- Affordable pricing with a free tier

## Prerequisites

- GitHub account
- Railway account (sign up at [railway.app](https://railway.app))
- Telegram bot token (see main [README.md](../README.md#how-to-get-telegram-credentials))

## Deployment Steps

### 1. Fork or Push Repository to GitHub

Ensure your code is in a GitHub repository that Railway can access.

### 2. Create a New Railway Project

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Authorize Railway to access your GitHub account (if not already done)
5. Select the `arreport` repository

### 3. Add MySQL Database Plugin

Railway makes it easy to add a MySQL database to your project:

1. In your Railway project, click "New" → "Database" → "Add MySQL"
2. Railway will provision a MySQL instance and automatically set these environment variables:
   - `MYSQLHOST` - Private domain for MySQL service
   - `MYSQLPORT` - MySQL port (3306)
   - `MYSQLUSER` - MySQL username (root)
   - `MYSQLPASSWORD` - Auto-generated secure password
   - `MYSQLDATABASE` - Database name (railway)
   - `MYSQL_URL` - Full private connection URL
   - `MYSQL_PUBLIC_URL` - Full public connection URL

**Important:** These variables are automatically set by Railway and use Railway's template variable syntax internally (e.g., `${{MYSQL_ROOT_PASSWORD}}`). You don't need to manually configure them.

### 4. Configure Application Environment Variables

In your Railway project settings, add these environment variables to your application service (not the MySQL service):

```env
# Required: Task storage type
TASKS_STORAGE=mysql

# Required: Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
TELEGRAM_WEBHOOK_SECRET=generate_a_random_secret_string
BOT_USERNAME=your_bot_username_without_@

# Required: Your Railway app URL (set after first deployment)
APP_BASE_URL=https://your-app-name.up.railway.app

# Optional: For sending AR reports via Telegram
TELEGRAM_CHAT_ID=your_chat_id

# Optional: For production debug endpoint access
DEBUG_API_KEY=generate_secure_random_key
```

**Note:** After the first deployment, Railway will provide a public URL. Update `APP_BASE_URL` with this URL.

### 5. Deploy the Application

Railway will automatically deploy your application:

1. Railway detects it's a Node.js/Next.js project
2. Runs `npm install` to install dependencies
3. Runs `npm run build` to build the application
4. Starts the application with `npm start`

Monitor the deployment logs in the Railway dashboard.

### 6. Configure Telegram Webhook

After successful deployment, you need to configure the Telegram webhook:

**Option A: Using the setup script (recommended)**

1. Clone your repository locally
2. Install dependencies: `npm install`
3. Create a `.env.local` file with Railway environment variables:
   ```env
   TELEGRAM_BOT_TOKEN=your_token
   TELEGRAM_WEBHOOK_SECRET=your_secret
   APP_BASE_URL=https://your-app-name.up.railway.app
   ```
4. Run the setup script:
   ```bash
   node scripts/setup-webhook.js
   ```

**Option B: Using curl**

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-app-name.up.railway.app/api/telegram/webhook",
    "secret_token": "your_webhook_secret",
    "allowed_updates": ["message", "edited_message"]
  }'
```

### 7. Test Your Deployment

1. Visit your Railway app URL: `https://your-app-name.up.railway.app`
2. Add your bot to a Telegram group
3. Send a test task: `/task Test deployment on Railway`
4. Visit `https://your-app-name.up.railway.app/tasks` to see the task

## Railway Environment Variables Reference

### Automatic MySQL Variables (Set by Railway)

When you add the MySQL plugin, Railway automatically sets:

| Variable | Description | Example |
|----------|-------------|---------|
| `MYSQLHOST` | Private MySQL hostname | `mysql.railway.internal` |
| `MYSQLPORT` | MySQL port | `3306` |
| `MYSQLUSER` | MySQL username | `root` |
| `MYSQLPASSWORD` | MySQL password | Auto-generated |
| `MYSQLDATABASE` | Database name | `railway` |
| `MYSQL_URL` | Private connection URL | `mysql://root:pass@host:3306/railway` |
| `MYSQL_PUBLIC_URL` | Public connection URL | `mysql://root:pass@proxy.railway.app:port/railway` |

### Required Application Variables (Set by You)

| Variable | Required | Description |
|----------|----------|-------------|
| `TASKS_STORAGE` | Yes | Set to `mysql` |
| `TELEGRAM_BOT_TOKEN` | Yes | Your bot token from @BotFather |
| `TELEGRAM_WEBHOOK_SECRET` | Yes | Random secret for webhook verification |
| `BOT_USERNAME` | Yes | Bot username without @ |
| `APP_BASE_URL` | Yes | Your Railway app URL |
| `TELEGRAM_CHAT_ID` | No | For AR report sending |
| `DEBUG_API_KEY` | No | For production debug access |

## Railway Template Variables

Railway uses template variables in their internal configuration (e.g., `${{MYSQL_ROOT_PASSWORD}}`). These are automatically resolved at runtime by Railway. You should **not** manually set these variables - Railway handles them automatically.

Example Railway MySQL configuration (handled automatically):
```
MYSQL_URL=mysql://${{MYSQLUSER}}:${{MYSQL_ROOT_PASSWORD}}@${{RAILWAY_PRIVATE_DOMAIN}}:3306/${{MYSQL_DATABASE}}
MYSQL_PUBLIC_URL=mysql://${{MYSQLUSER}}:${{MYSQL_ROOT_PASSWORD}}@${{RAILWAY_TCP_PROXY_DOMAIN}}:${{RAILWAY_TCP_PROXY_PORT}}/${{MYSQL_DATABASE}}
```

## Monitoring and Logs

### View Application Logs

In the Railway dashboard:
1. Select your application service
2. Click on the "Deployments" tab
3. Select the latest deployment
4. View real-time logs

### Check MySQL Connection

The application logs will show MySQL connection status:
```
[MySQL] Initializing connection to: { host: 'configured', port: 3306, user: 'configured', database: 'railway' }
[MySQL] Testing database connection...
[MySQL] Connection test successful
[MySQL] Creating tasks table if not exists...
[MySQL] Tasks table ready
[MySQL] Database initialized successfully
```

### Access MySQL Database

Railway provides a MySQL client interface:
1. Go to your MySQL service in Railway
2. Click "Connect" to get connection details
3. Use a MySQL client (MySQL Workbench, TablePlus, etc.) with the public connection URL

### Debug Storage Endpoint

Access the debug endpoint to verify storage configuration:

**Development (no auth required):**
```bash
curl http://localhost:3000/api/debug-storage
```

**Production (requires DEBUG_API_KEY):**
```bash
curl -H "Authorization: Bearer YOUR_DEBUG_API_KEY" https://your-app.up.railway.app/api/debug-storage
```

## Troubleshooting

### Deployment Fails

**Build errors:**
- Check Railway build logs for specific error messages
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

**Environment variables missing:**
- Verify all required variables are set in Railway dashboard
- Check for typos in variable names
- Ensure `TASKS_STORAGE=mysql` is set

### MySQL Connection Issues

**"MySQL initialization failed" error:**
- Verify MySQL plugin is added to your Railway project
- Check that MySQL and app services are in the same project
- Ensure the app has finished deploying before testing
- Check Railway logs for specific MySQL error messages

**"ECONNREFUSED" error:**
- MySQL service may still be starting - wait a few seconds and retry
- Verify `MYSQLHOST` is set to Railway's internal hostname
- Check Railway service status in dashboard

### Webhook Not Working

**Bot doesn't respond to messages:**
- Verify webhook is set: `curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo`
- Check that `APP_BASE_URL` matches your Railway URL exactly
- Ensure `TELEGRAM_WEBHOOK_SECRET` matches between app and webhook setup
- Verify bot has permission to read messages in groups (Privacy Mode off)

**"Webhook verification failed" error:**
- `TELEGRAM_WEBHOOK_SECRET` must match between app environment and webhook configuration
- Re-run webhook setup script after fixing the secret

### Tasks Not Persisting

**Tasks disappear after app restarts:**
- Verify `TASKS_STORAGE=mysql` is set (not `sqlite`)
- Check MySQL service is running in Railway dashboard
- Review application logs for MySQL connection errors

**"Error fetching tasks" in UI:**
- Check browser console for detailed error messages
- Verify API routes are accessible: visit `/api/tasks`
- Check Railway logs for server-side errors

## Cost Considerations

Railway offers:
- **Free tier**: $5 credit per month (includes hobby projects)
- **Developer plan**: Pay-as-you-go pricing
- **MySQL pricing**: Based on usage (storage, compute)

Monitor your usage in the Railway dashboard to stay within budget.

## Migration from Other Platforms

### From Vercel/Netlify

1. Update `TASKS_STORAGE` from `sqlite` to `mysql`
2. Add MySQL plugin on Railway
3. Existing SQLite data won't be migrated automatically
4. See [MYSQL_SETUP.md](MYSQL_SETUP.md#migration-from-sqlite) for migration instructions

### From Self-Hosted MySQL

If you have an existing MySQL database, you can use it with Railway:

1. Don't add the Railway MySQL plugin
2. Set these environment variables manually:
   ```env
   TASKS_STORAGE=mysql
   MYSQL_HOST=your_mysql_host
   MYSQL_PORT=3306
   MYSQL_USER=your_user
   MYSQL_PASSWORD=your_password
   MYSQL_DATABASE=your_database
   ```

## Security Best Practices

1. **Use strong secrets**: Generate random strings for `TELEGRAM_WEBHOOK_SECRET` and `DEBUG_API_KEY`
2. **Protect sensitive variables**: Railway automatically encrypts environment variables
3. **Enable Railway's private networking**: MySQL automatically uses private networking
4. **Regular updates**: Keep dependencies updated with `npm update`
5. **Monitor logs**: Regularly check Railway logs for suspicious activity

## Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [Railway MySQL Plugin](https://docs.railway.app/databases/mysql)
- [Main README](../README.md)
- [MySQL Setup Guide](MYSQL_SETUP.md)

## Support

For Railway-specific issues:
- [Railway Discord](https://discord.gg/railway)
- [Railway Help Center](https://help.railway.app)

For application issues:
- Check the [main README troubleshooting](../README.md#troubleshooting)
- Open an issue on [GitHub](https://github.com/sagestoneinc/arreport/issues)
