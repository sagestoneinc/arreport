#!/usr/bin/env node

/**
 * Webhook Setup Script
 * 
 * This script sets up the Telegram webhook for the Task Collector bot.
 * 
 * Usage:
 *   node scripts/setup-webhook.js
 * 
 * Required environment variables:
 *   - TELEGRAM_BOT_TOKEN
 *   - APP_BASE_URL
 *   - TELEGRAM_WEBHOOK_SECRET
 */

const https = require('https');

// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const APP_BASE_URL = process.env.APP_BASE_URL;
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

if (!BOT_TOKEN) {
  console.error('❌ Error: TELEGRAM_BOT_TOKEN not found in environment variables');
  process.exit(1);
}

if (!APP_BASE_URL) {
  console.error('❌ Error: APP_BASE_URL not found in environment variables');
  process.exit(1);
}

if (!WEBHOOK_SECRET) {
  console.error('❌ Error: TELEGRAM_WEBHOOK_SECRET not found in environment variables');
  process.exit(1);
}

const webhookUrl = `${APP_BASE_URL}/api/telegram/webhook`;

console.log('🚀 Setting up Telegram webhook...');
console.log(`📍 Webhook URL: ${webhookUrl}`);

const apiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`;
const data = JSON.stringify({
  url: webhookUrl,
  secret_token: WEBHOOK_SECRET,
  allowed_updates: ['message', 'edited_message'],
});

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
  },
};

const req = https.request(apiUrl, options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    try {
      const result = JSON.parse(responseData);
      
      if (result.ok) {
        console.log('✅ Webhook set successfully!');
        console.log(`📝 Description: ${result.description}`);
      } else {
        console.error('❌ Failed to set webhook');
        console.error(`Error: ${result.description}`);
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Failed to parse response:', error.message);
      console.error('Response:', responseData);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
  process.exit(1);
});

req.write(data);
req.end();
