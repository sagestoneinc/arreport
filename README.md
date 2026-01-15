# AR Update Generator

A production-ready web application for generating Telegram-formatted Approval Rate (AR) updates with exact formatting requirements.

## Features

- ✅ Generate Telegram-formatted AR update messages
- ✅ Support for Historical and Hourly modes
- ✅ One-click copy to clipboard
- ✅ Optional Telegram Bot API integration
- ✅ Real-time AR calculation from sales/declines
- ✅ Dynamic MID row management (add/remove)
- ✅ Pre-filled demo data for testing
- ✅ Responsive design for all devices
- ✅ Input validation and error handling

## Tech Stack

- **Next. js 14+** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Telegram Bot API** integration

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository: 
```bash
git clone <your-repo-url>
cd ar-update-generator
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
TELEGRAM_CHAT_ID=your_chat_id_here
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
TELEGRAM_CHAT_ID=your_chat_id_here
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
3. Visit:  `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4. Look for `"chat": {"id":123456789}` in the response
5. Copy the chat ID number

## Usage

1. **Enter Date/Time**:  Select the date, time, and timezone for the update
2. **Key Action**:  Describe the main action taken (e.g., "shifted traffic away from low AR MIDs")
3. **Fill Metrics**: Enter sales and declines for Daily Summary and Hourly Update sections
4. **Add MIDs**: Use the "+" button to add MID rows, enter MID names and metrics
5. **Generate**:  Click "Generate Message" to create the formatted output
6. **Copy**: Click "Copy to Clipboard" to copy the message
7. **Send** (Optional): Expand "Send to Telegram" section and click "Send Message"

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Visit [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel dashboard: 
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
5. Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Render
- AWS Amplify

## Security Notes

⚠️ **IMPORTANT**: Never commit API tokens or secrets to Git! 

- Always use `.env.local` for local development
- Add `.env.local` to `.gitignore`
- Use environment variables in production
- Keep your bot token private
- Consider using the UI input fields for testing instead of environment variables

## Output Format

The app generates messages in this exact format:

```
📊 AR Update – MID Optimization
🗓️ 01/15/2026 | 🕐 1:00 AM EST
Key Action: Example: shifted traffic away from low AR MIDs

DAILY SUMMARY
Overall: 0.00% (0 sales / 0 declines)
VISA: 0.00% (0 / 0)
MC: 0.00% (0 / 0)

HOURLY UPDATE
Overall: 0.00% (0 sales / 0 declines)
VISA: 0.00% (0 / 0)
MC: 0.00% (0 / 0)

VISA — Top MIDs
- CS_395: 83.05% (49 sales / 10 declines)
- CS_394: 77.52% (100 sales / 29 declines)

VISA — Worst MIDs
- CS_394: 77.52% (100 sales / 29 declines)
- CS_395: 83.05% (49 sales / 10 declines)

MASTERCARD — Top MIDs

MASTERCARD — Worst MIDs

```

## Project Structure

```
ar-update-generator/
├── app/
│   ├── api/
│   │   └── telegram/
│   │       └── send/
│   │           └── route.ts
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ARUpdateForm.tsx
│   ├── MetricRow.tsx
│   ├── MIDRow.tsx
│   ├── MIDSection.tsx
│   ├── OutputDisplay.tsx
│   └── TelegramSender.tsx
├── lib/
│   ├── types. ts
│   ├── calculations.ts
│   └── formatters.ts
├── . env.example
├── .gitignore
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## License

MIT

## Support

For issues or questions, please open an issue on GitHub. 