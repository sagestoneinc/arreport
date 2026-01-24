# MySQL Setup Guide for Task Collector

This guide explains how to set up MySQL as the database backend for the Telegram Task Collector bot.

## Prerequisites

- MySQL 5.7+ or MariaDB 10.2+
- Access to create databases and users

## Step 1: Create Database

Connect to your MySQL server and create a database:

```sql
CREATE DATABASE arreport CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Step 2: Create User (Optional but Recommended)

For security, create a dedicated user for the application:

```sql
CREATE USER 'arreport_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON arreport.* TO 'arreport_user'@'localhost';
FLUSH PRIVILEGES;
```

If your app connects from a different host, replace `'localhost'` with the appropriate hostname or `'%'` for any host.

## Step 3: Configure Environment Variables

Add these variables to your `.env.local` file:

```env
# Set storage type to mysql
TASKS_STORAGE=mysql

# MySQL connection settings
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=arreport_user
MYSQL_PASSWORD=your_secure_password
MYSQL_DATABASE=arreport
```

## Step 4: Verify Connection

Start your application:

```bash
npm run dev
```

The application will automatically create the required tables on first run. Check your console for any connection errors.

## Step 5: Test the Setup

1. Visit your application at `http://localhost:3000/tasks`
2. Trigger a task from Telegram by sending a message with `/task Test task`
3. Refresh the tasks page to verify the task appears

## Troubleshooting

### Connection Errors

**Error: "Access denied for user"**
- Verify username and password are correct
- Check that the user has privileges on the database
- Ensure the user can connect from your application's host

**Error: "Unknown database"**
- Verify the database exists: `SHOW DATABASES;`
- Check the database name in your environment variables

**Error: "Can't connect to MySQL server"**
- Verify MySQL is running: `systemctl status mysql` (Linux)
- Check the host and port are correct
- Verify firewall rules allow connections

### Performance Tips

1. **Connection Pooling**: The implementation uses connection pooling by default with 10 connections
2. **Indexes**: The schema includes indexes on frequently queried columns (status, chat_id, created_at)
3. **Character Set**: Uses utf8mb4 for full Unicode support including emojis

## Migration from SQLite

To migrate existing tasks from SQLite to MySQL:

1. Export tasks from SQLite:
   ```bash
   sqlite3 data/tasks.db ".mode csv" ".headers on" ".output tasks.csv" "SELECT * FROM tasks;"
   ```

2. Import to MySQL:
   ```sql
   LOAD DATA LOCAL INFILE 'tasks.csv'
   INTO TABLE tasks
   FIELDS TERMINATED BY ','
   ENCLOSED BY '"'
   LINES TERMINATED BY '\n'
   IGNORE 1 ROWS;
   ```

## Security Best Practices

1. **Never commit credentials**: Always use environment variables
2. **Use strong passwords**: Generate secure passwords for database users
3. **Restrict privileges**: Grant only necessary permissions
4. **Use SSL/TLS**: For production, enable encrypted connections
5. **Regular backups**: Schedule automated backups of your database

## Production Deployment

### Using Managed MySQL Services

**AWS RDS:**
```env
MYSQL_HOST=your-instance.region.rds.amazonaws.com
MYSQL_PORT=3306
MYSQL_USER=admin
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=arreport
```

**Google Cloud SQL:**
```env
MYSQL_HOST=/cloudsql/project:region:instance
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=arreport
```

**Azure Database for MySQL:**
```env
MYSQL_HOST=your-server.mysql.database.azure.com
MYSQL_PORT=3306
MYSQL_USER=admin@your-server
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=arreport
```

**Railway:**

Railway provides managed MySQL through their plugin system. When you add the MySQL plugin to your Railway project, it automatically provisions a MySQL database and sets the following environment variables:

1. Add the MySQL plugin to your Railway project:
   - Go to your Railway project dashboard
   - Click "New" → "Database" → "Add MySQL"
   - Railway will provision a MySQL instance and automatically set environment variables

2. Configure your application to use MySQL:
   ```env
   TASKS_STORAGE=mysql
   ```

3. Railway automatically sets these environment variables (no manual configuration needed):
   - `MYSQLHOST` - The private domain of the MySQL service (e.g., `mysql.railway.internal`)
   - `MYSQLPORT` - MySQL port (default: `3306`)
   - `MYSQLUSER` - MySQL username (default: `root`)
   - `MYSQLPASSWORD` - Auto-generated MySQL root password
   - `MYSQLDATABASE` - Database name (default: `railway`)
   - `MYSQL_URL` - Full private connection string
   - `MYSQL_PUBLIC_URL` - Full public connection string (for external access)

4. The application automatically detects and uses these Railway environment variables. No additional configuration is required.

5. Deploy your application:
   - Railway will automatically build and deploy your app
   - The MySQL tables will be created on first run
   - Your Task Collector bot will start using the MySQL database

**Note:** Railway uses internal template variables in their configuration (e.g., `${{MYSQL_ROOT_PASSWORD}}` → `MYSQLPASSWORD`). These template variables are automatically resolved by Railway and stored in environment variables. You should not manually set template variables - Railway handles this when you add the MySQL plugin.

## Monitoring

Monitor your MySQL database performance:

```sql
-- Check table size
SELECT 
  TABLE_NAME,
  ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'arreport'
  AND TABLE_NAME = 'tasks';

-- Check number of tasks
SELECT status, COUNT(*) as count FROM tasks GROUP BY status;

-- Check recent tasks
SELECT created_at, description FROM tasks ORDER BY created_at DESC LIMIT 10;
```

## Support

For issues or questions:
- Check the main [README.md](../README.md) troubleshooting section
- Review MySQL server logs
- Open an issue on GitHub
