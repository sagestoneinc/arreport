# AR MID Optimization Generator

A production-ready Next.js web application for generating Telegram-formatted Approval Rate (AR) updates for MID optimization tracking. Supports **two output templates** with dynamic MID management, real-time AR calculation, and threshold-based status determination.

## Features

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
- ✅ Full test coverage with Vitest
- ✅ ESLint + Prettier for code quality
- ✅ SEO optimization

## Tech Stack

- **Next.js 14+** (App Router) + TypeScript
- **Tailwind CSS** for styling
- **Vitest** for testing
- **No database** (all client state, optional localStorage)
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
```
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_default_chat_id_here
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
arreport/
├── app/
│   ├── api/
│   │   └── telegram/
│   │       └── send/
│   │           └── route.ts       # Telegram API endpoint
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
│   ├── types.ts                   # TypeScript interfaces
│   ├── defaults.ts                # Default sample data (both templates)
│   ├── calc.ts                    # AR calculations & status
│   ├── format.ts                  # Main formatter dispatcher
│   ├── formatTemplateA.ts         # Template A formatter
│   ├── formatTemplateB.ts         # Template B formatter
│   └── validate.ts                # JSON import validation
├── __tests__/
│   ├── calc.test.ts               # Calculation tests
│   ├── formatTemplateA.test.ts    # Template A output tests
│   └── formatTemplateB.test.ts    # Template B output tests
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

## License

MIT License - see LICENSE file for details.

## Support

For issues or questions, please open an issue on GitHub. 