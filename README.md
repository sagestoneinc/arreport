# AR MID Optimization Generator

A production-ready Next.js web application for generating Telegram-formatted Approval Rate (AR) updates for MID optimization tracking. Takes sales/declines inputs and produces messages matching an exact format with emojis, thresholds, and status indicators.

## Features

- ✅ Exact Telegram message formatting with emojis
- ✅ Dynamic MID management (VISA: up to 4, MASTERCARD: up to 5)
- ✅ Real-time AR calculation and status determination
- ✅ Threshold-based PERFORMING/LOW classification
- ✅ One-click copy to clipboard
- ✅ JSON export/import for state persistence
- ✅ Optional Telegram Bot API integration
- ✅ Responsive mobile-friendly design
- ✅ Pre-filled demo data matching exact sample output

## Tech Stack

- **Next.js 14+** (App Router) + TypeScript
- **Tailwind CSS** for styling
- **No database** (all client state, optional localStorage)
- Strong typing (no `any` types)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm package manager

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd ar-mid-optimization-generator
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
```
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_default_chat_id_here
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create a `.env.local` file in the root directory:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_default_chat_id_here
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

1. **Report Date/Time**: Set the date and time for the AR update (defaults to sample data)
2. **Threshold**: Enter the performing AR threshold percentage (default: 38%)
3. **Daily Summary**: Enter daily sales and declines (auto-calculates AR)
4. **VISA MIDs**: Add up to 4 VISA MIDs with sales/declines (auto-calculates AR and status)
5. **MASTERCARD MIDs**: Add up to 5 MASTERCARD MIDs with sales/declines
6. **Notes**: Add optimization notes or action taken
7. **Generate**: Click "Generate Message" to create formatted output
8. **Copy**: Click "Copy to Clipboard" to copy the message
9. **Export/Import**: Save/load state as JSON for reuse
10. **Send** (Optional): Expand "Send to Telegram" and send directly via Bot API

## Exact Output Format

The application generates messages in this precise format:

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

### Calculation Rules

- **AR%** = sales / (sales + declines) × 100
- If sales + declines == 0 then AR% = 0.00
- Display with 2 decimals everywhere (e.g., 24.73%)
- **Status logic**:
  - if AR% >= threshold => "PERFORMING"
  - else => "LOW"
- For MID lines: `(sales / declines)` format
- For Daily Summary: `(X sales / Y declines)` format

### Formatting Rules

- Uses en dash "–" in section headers (not hyphen)
- Exact emojis: 📊 🗓️ 🕐 🎯 📌 ✅ ⚠️ 📝
- Timezone always shows "EST" (fixed)
- Blank lines match exact specification
- Empty LOW sections show "(none)" on next line
- All headers present even if empty

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Visit [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel dashboard:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID` (optional)
5. Deploy

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
ar-mid-optimization-generator/
├── app/
│   ├── api/
│   │   └── telegram/
│   │       └── send/
│   │           └── route.ts       # Telegram API endpoint
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Main page (client component)
│   └── globals.css                # Global styles
├── components/
│   ├── HeaderInputs.tsx           # Date, time, threshold inputs
│   ├── DailySummaryInputs.tsx     # Daily summary inputs
│   ├── MidTableEditor.tsx         # Dynamic MID row editor
│   ├── NotesInput.tsx             # Notes textarea
│   ├── OutputPanel.tsx            # Generated output + export/import
│   └── TelegramPanel.tsx          # Optional Telegram sender
├── lib/
│   ├── types.ts                   # TypeScript interfaces
│   ├── defaults.ts                # Default sample data
│   ├── calc.ts                    # AR calculations & status
│   ├── format.ts                  # Telegram message formatter
│   └── validate.ts                # JSON import validation
├── .env.example                   # Environment variable template
├── .gitignore                     # Git ignore rules
├── LICENSE                        # MIT License
├── README.md                      # This file
├── package.json                   # Dependencies
├── tailwind.config.ts             # Tailwind configuration
└── tsconfig.json                  # TypeScript configuration
```

## Security Notes

⚠️ **IMPORTANT**: Never commit API tokens or secrets to Git!

- Always use `.env.local` for local development
- Add `.env.local` to `.gitignore` (already included)
- Use environment variables in production
- Keep your bot token private
- Token must come from environment only (never hardcoded)

## Development

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

### Start Production Server

```bash
npm start
```

## License

MIT License - see LICENSE file for details.

## Support

For issues or questions, please open an issue on GitHub. 