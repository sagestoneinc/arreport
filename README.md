# AR MID Optimization Generator

A production-ready Next.js web application for generating Telegram-formatted Approval Rate (AR) updates for MID optimization tracking. Supports **two output templates** with dynamic MID management, real-time AR calculation, and threshold-based status determination.

**NEW:** Now includes a **Telegram Task Collector Bot** that captures tasks from group chats and provides a web interface to manage them!

## Features

### AR Report Templates
- ✅ **Dual Template Support**:
  - **Template A**: Top/Worst MIDs format with daily summary and hourly updates
  - **Template B**: Threshold Performing/Low format with sales/declines grouping
- ✅ Template-specific localStorage persistence
- ✅ Exact Telegram message formatting with emojis
- ✅ Dynamic MID management (VISA: up to 4, MASTERCARD: up to 5)
- ✅ Real-time AR calculation and status determination
- ✅ Threshold-based PERFORMING/LOW classification
- ✅ One-click copy to clipboard
- ✅ JSON export/import for state persistence
- ✅ Optional Telegram Bot API integration
- ✅ Responsive mobile-friendly design
- ✅ Pre-filled demo data matching exact sample output

### Task Collector Bot (NEW!)
- ✅ **Webhook-based Telegram bot** for capturing tasks from group chats
- ✅ Multiple task trigger formats (`@botname - task`, `/task`, `/todo`)
- ✅ **SQLite database** for persistent task storage
- ✅ **Web UI** for viewing and managing tasks
- ✅ Filter tasks by status (open/done) and chat
- ✅ Mark tasks as done/open with one click
- ✅ Export open tasks as text (copy/download)
- ✅ Delete tasks
- ✅ Support for edited messages
- ✅ Rate limiting to prevent loops
- ✅ Serverless-friendly architecture

### Quality Assurance
- ✅ Full test coverage with Vitest
- ✅ ESLint + Prettier for code quality
- ✅ SEO optimization
- ✅ Strong typing (no `any` types)

## Tech Stack

- **Next.js 14+** (App Router) + TypeScript
- **Tailwind CSS** for styling
- **Vitest** for testing
- **Database**: SQLite (better-sqlite3) or MySQL (mysql2) for task storage
- Strong typing (no `any` types)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/sagestoneinc/arreport.git
cd arreport
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. (Optional) Add your Telegram credentials to `.env.local`:
```env
# For sending AR reports
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_default_chat_id_here

# For Task Collector Bot (see Task Collector Setup section)
TELEGRAM_WEBHOOK_SECRET=your_random_secret_here
APP_BASE_URL=https://your-app-domain.com
BOT_USERNAME=your_bot_username
TASKS_STORAGE=sqlite
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
```

## Environment Variables

### AR Report Generator Variables

Create a `.env.local` file in the root directory:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_default_chat_id_here
```

### Task Collector Bot Variables (NEW!)

Additional variables needed for the Task Collector bot:

```env
# Telegram webhook secret (generate a random string)
TELEGRAM_WEBHOOK_SECRET=your_random_secret_token

# Your app's public URL (required for webhook)
APP_BASE_URL=https://arreport.example.com

# Bot username (without @, for mention matching)
BOT_USERNAME=your_bot_username

# Task storage type (default: sqlite)
# Options: "sqlite" | "mysql" | "memory"
TASKS_STORAGE=sqlite

# MySQL Configuration (only if TASKS_STORAGE=mysql)
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=arreport
```

### How to Get Telegram Credentials

**Bot Token:**
1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send `/newbot` command
3. Follow instructions to create your bot
4. Copy the bot token provided

**Chat ID:**
1. Start a chat with your bot
2. Send any message
3. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4. Look for `"chat": {"id":123456789}` in the response
5. Copy the chat ID number

## Usage

1. **Select Template**: Choose between Template A (Top/Worst) or Template B (Threshold Performing/Low)
2. **Report Date/Time**: Set the date and time for the AR update (defaults to sample data)
3. **Threshold**: Enter the performing AR threshold percentage (default: 38%)
4. **Daily Summary**: Enter daily sales and declines (auto-calculates AR)
5. **VISA MIDs**: Add up to 4 VISA MIDs with sales/declines (auto-calculates AR and status)
6. **MASTERCARD MIDs**: Add up to 5 MASTERCARD MIDs with sales/declines
7. **Notes**: Add optimization notes or action taken
8. **Generate**: Click "Generate Message" to create formatted output
9. **Copy**: Click "Copy to Clipboard" to copy the message
10. **Export/Import**: Save/load state as JSON for reuse
11. **Send** (Optional): Expand "Send to Telegram" and send directly via Bot API

## Template Formats

### Template A: Top/Worst MIDs

Classic format showing PERFORMING and LOW MIDs with AR percentages:

```
📊 AR Update – MID Optimization
🗓️ 01/15/2026 | 🕐 1:00 AM EST
🎯 Threshold (Performing): 38%

📌 DAILY SUMMARY
Overall AR: 24.73% (918 sales / 2794 declines)

✅ VISA – PERFORMING MIDs
- CS_396_SkinPuraVida_0100: 40.95% (43 / 62)

⚠️ VISA – LOW MIDs
- CS_395_VitalComplexion_0164: 35.00% (28 / 52)

✅ MASTERCARD – PERFORMING MIDs
- PAY-REV_372_FitFlexDiet_6315: 64.52% (20 / 11)
- PAY-REV_349_MedicalScreenPro_0535: 68.97% (20 / 9)
- PAY-REV_352_HealthScreenAssist_9594: 51.35% (19 / 18)
- PAY-REV_347_SmoothSkinRevival_7651: 51.85% (14 / 13)

⚠️ MASTERCARD – LOW MIDs
(none)


📝 Notes / Action Taken:
Enter optimization notes, routing changes, or monitoring actions here.
```

### Template B: Threshold Performing/Low

Same format as Template A but with emphasis on threshold-based grouping:
- Output MID line format: `- {MID}: {AR}% ({sales} / {declines})`
- Daily line format: `Overall AR: {AR}% ({sales} sales / {declines} declines)`
- Shows "(none)" for empty sections

### Calculation Rules

- **AR%** = sales / (sales + declines) × 100
- If sales + declines == 0 then AR% = 0.00
- Display with 2 decimals everywhere (e.g., 24.73%)
- **Status logic**:
  - if AR% >= threshold => "PERFORMING"
  - else => "LOW"
- For MID lines: `{AR}% (sales / declines)` format
- For Daily Summary: `{AR}% (X sales / Y declines)` format

### Formatting Rules

- Uses en dash "–" in section headers (not hyphen)
- Exact emojis: 📊 🗓️ 🕐 🎯 📌 ✅ ⚠️ 📝
- Timezone always shows "EST" (fixed)
- Blank lines match exact specification
- Empty LOW sections show "(none)" on next line
- All headers present even if empty
- Double blank line before Notes section

## Task Collector Bot (NEW!)

The Task Collector Bot is a Telegram webhook-based bot that captures tasks from group chats and provides a web interface to manage them.

### Features

- 📋 **Multiple trigger formats**: `@botname - task`, `/task`, `/todo`
- 💾 **Persistent storage**: SQLite database for reliable task tracking
- 🌐 **Web UI**: View, filter, and manage tasks from any browser
- ✅ **Task management**: Mark as done/open, delete, or export
- 🔄 **Edit support**: Updates tasks when Telegram messages are edited
- 🛡️ **Security**: Webhook secret verification, rate limiting
- 🚀 **Serverless-friendly**: Works on Vercel, Netlify, and other platforms

### Task Trigger Formats

The bot recognizes the following message formats:

1. **Command format**:
   ```
   /task Review the pull request
   /todo Update documentation
   ```

2. **Mention with dash**:
   ```
   @yourbotname - Deploy to staging
   ```

3. **Mention without dash**:
   ```
   @yourbotname Check the logs
   ```

### Setup Instructions

#### 1. Create or Configure Your Bot

If you already have a bot token from setting up the AR report feature, you can reuse it. Otherwise:

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send `/newbot` and follow instructions
3. Copy the bot token provided
4. Send `/setcommands` to BotFather and add these commands:
   ```
   task - Add a new task
   todo - Add a new task
   ```

#### 2. Add Bot to Your Group

1. Add your bot to the Telegram group where you want to collect tasks
2. Make sure the bot has permission to read messages:
   - Go to BotFather → select your bot → Bot Settings → Group Privacy → Disable

#### 3. Configure Environment Variables

Add these to your `.env.local` file:

```env
# Your bot token from BotFather
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11

# Generate a random secret (use a password generator)
TELEGRAM_WEBHOOK_SECRET=your_random_secret_string_here

# Your app's public URL (IMPORTANT: must be HTTPS in production)
APP_BASE_URL=https://arreport.example.com

# Your bot's username (without @)
BOT_USERNAME=your_bot_name

# Storage type (default: sqlite)
TASKS_STORAGE=sqlite
```

#### 4. Deploy Your Application

Deploy to a platform with HTTPS support (required for Telegram webhooks):

- **Vercel** (recommended): Add all environment variables in project settings
- **Netlify**: Add environment variables in site settings
- **Railway/Render**: Add environment variables in dashboard

#### 5. Set Up the Webhook

After deploying, run the webhook setup script:

```bash
node scripts/setup-webhook.js
```

You should see:
```
✅ Webhook set successfully!
📝 Description: Webhook was set
```

**Alternative**: Manually set the webhook using curl:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-app-domain.com/api/telegram/webhook",
    "secret_token": "your_random_secret",
    "allowed_updates": ["message", "edited_message"]
  }'
```

### Using the Task Collector

#### In Telegram

Send messages in any of these formats:

```
/task Review the quarterly report
/todo Fix bug in login page
@yourbotname - Deploy v2.0 to production
```

The bot will:
- ✅ Save the task to the database
- 💬 Reply with "✅ Task saved: {description}" (for `/task`, `/todo`, or mentions with `-`)
- 🔗 Include a link to view all tasks (if `APP_BASE_URL` is configured)

#### In the Web Interface

1. Visit `/tasks` on your deployed app (or click "📋 View Tasks" from the home page)
2. **Filter tasks**:
   - By status: All, Open, or Done
   - By chat: Select from dropdown
3. **Manage tasks**:
   - ✅ Click checkbox to mark done/open
   - 🗑️ Click trash icon to delete
4. **Export tasks**:
   - 📋 "Copy Open" - Copy open tasks to clipboard
   - 💾 "Download" - Download as text file

### Storage Options

The bot supports multiple storage backends:

1. **SQLite** (default, recommended for single-server deployments):
   - Persistent storage in `/data/tasks.db`
   - Set `TASKS_STORAGE=sqlite` (or omit for default)
   - Works on most platforms
   - Note: Vercel requires [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) or external DB for persistent data

2. **MySQL** (recommended for production/multi-server):
   - Persistent storage in MySQL database
   - Set `TASKS_STORAGE=mysql`
   - Requires MySQL 5.7+ or MariaDB 10.2+
   - Configure connection settings:
     ```env
     TASKS_STORAGE=mysql
     MYSQL_HOST=localhost
     MYSQL_PORT=3306
     MYSQL_USER=your_username
     MYSQL_PASSWORD=your_password
     MYSQL_DATABASE=arreport
     ```
   - Tables are created automatically on first run
   - Supports connection pooling for better performance
   - **[See detailed MySQL setup guide →](docs/MYSQL_SETUP.md)**

3. **Memory** (testing only):
   - Set `TASKS_STORAGE=memory`
   - Tasks lost on restart
   - Good for testing

### Rate Limiting

The bot includes built-in rate limiting (5 requests per chat per minute) to prevent:
- Infinite loops if the bot responds to itself
- Spam in busy groups
- Resource exhaustion

### Troubleshooting

**Bot doesn't respond to messages:**
- Verify bot is in the group and has message reading permission
- Check webhook is set: `curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo`
- Check application logs for errors

**Webhook verification fails:**
- Ensure `TELEGRAM_WEBHOOK_SECRET` matches in both environment and webhook setup
- Verify the secret is set when configuring the webhook

**Tasks not persisting:**
- **SQLite**: Check `/data` directory exists and is writable
- **SQLite**: Verify `TASKS_STORAGE=sqlite` in environment variables
- **MySQL**: Verify database connection settings and credentials
- **MySQL**: Ensure database exists (create with `CREATE DATABASE arreport;`)
- On Vercel, use MySQL or [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)

**"Error fetching tasks" in UI:**
- Verify the application is running
- Check browser console for errors
- Ensure API routes are accessible

### Security Considerations

✅ **Webhook Secret**: Always set `TELEGRAM_WEBHOOK_SECRET` to prevent unauthorized webhook calls

✅ **HTTPS Required**: Telegram only sends webhooks to HTTPS endpoints

✅ **No Client Secrets**: All sensitive data stays server-side

✅ **Rate Limiting**: Built-in protection against spam and loops

⚠️ **Access Control**: The `/tasks` page is publicly accessible. Add authentication if needed.

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Visit [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel dashboard:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID` (optional, for AR reports)
   - `TELEGRAM_WEBHOOK_SECRET` (for Task Collector)
   - `APP_BASE_URL` (for Task Collector)
   - `BOT_USERNAME` (for Task Collector)
   - `TASKS_STORAGE` (optional, default: sqlite)
5. Deploy
6. After deployment, run `node scripts/setup-webhook.js` to configure the Telegram webhook

**Note**: For persistent task storage on Vercel, consider using [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) or an external database, as the serverless file system is ephemeral.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Render
- AWS Amplify
- Docker (Dockerfile included)

## Project Structure

```
arreport/
├── app/
│   ├── api/
│   │   ├── tasks/
│   │   │   ├── [id]/
│   │   │   │   └── route.ts       # PATCH/DELETE individual task
│   │   │   └── route.ts           # GET tasks with filters
│   │   └── telegram/
│   │       ├── webhook/
│   │       │   └── route.ts       # Telegram webhook endpoint
│   │       └── route.ts           # Send messages endpoint
│   ├── tasks/
│   │   └── page.tsx               # Tasks management UI (NEW!)
│   ├── layout.tsx                 # Root layout with SEO
│   ├── page.tsx                   # Main page with template switching
│   └── globals.css                # Global styles
├── components/
│   ├── TemplateSelector.tsx       # Template A/B selector
│   ├── HeaderInputs.tsx           # Date, time, threshold inputs
│   ├── DailySummaryInputs.tsx     # Daily summary inputs
│   ├── MidTableEditor.tsx         # Dynamic MID row editor
│   ├── NotesInput.tsx             # Notes textarea
│   ├── OutputPanel.tsx            # Generated output + export/import
│   └── TelegramPanel.tsx          # Optional Telegram sender
├── lib/
│   ├── taskTypes.ts               # Task-related TypeScript types (NEW!)
│   ├── taskParser.ts              # Telegram message parser (NEW!)
│   ├── taskStorage.ts             # SQLite storage layer (NEW!)
│   ├── types.ts                   # TypeScript interfaces
│   ├── defaults.ts                # Default sample data (both templates)
│   ├── calc.ts                    # AR calculations & status
│   ├── format.ts                  # Main formatter dispatcher
│   ├── formatTemplateA.ts         # Template A formatter
│   ├── formatTemplateB.ts         # Template B formatter
│   └── validate.ts                # JSON import validation
├── scripts/
│   └── setup-webhook.js           # Webhook configuration script (NEW!)
├── __tests__/
│   ├── taskParser.test.ts         # Task parser tests (NEW!)
│   ├── calc.test.ts               # Calculation tests
│   ├── formatTemplateA.test.ts    # Template A output tests
│   └── formatTemplateB.test.ts    # Template B output tests
├── data/                          # Task database (gitignored, NEW!)
│   └── tasks.db                   # SQLite database
├── .env.example                   # Environment variable template
├── .eslintrc.json                 # ESLint configuration
├── .prettierrc.json               # Prettier configuration
├── .prettierignore                # Prettier ignore rules
├── .gitignore                     # Git ignore rules
├── vitest.config.ts               # Vitest configuration
├── LICENSE                        # MIT License
├── README.md                      # This file
├── package.json                   # Dependencies and scripts
├── tailwind.config.ts             # Tailwind configuration
└── tsconfig.json                  # TypeScript configuration
```

## Testing

The application includes comprehensive tests for:
- Calculation functions (AR%, formatting, status determination)
- Template A output format
- Template B output format
- Task parser (Telegram message parsing, trigger detection)
- Edge cases (empty lists, zero values, etc.)

Run tests with:
```bash
npm test              # Run once
npm run test:watch    # Watch mode
```

## Security Notes

⚠️ **IMPORTANT**: Never commit API tokens or secrets to Git!

- Always use `.env.local` for local development
- Add `.env.local` to `.gitignore` (already included)
- Use environment variables in production
- Keep your bot token private
- Token must come from environment only (never hardcoded)
- **Task Collector**: Use a strong random string for `TELEGRAM_WEBHOOK_SECRET`
- **Task Collector**: Webhook endpoint verifies secret token on every request
- **Task Collector**: Rate limiting prevents spam and infinite loops

## License

MIT License - see LICENSE file for details.

## Support

For issues or questions, please open an issue on GitHub. 