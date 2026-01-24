import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AR MID Optimization Generator - Approval Rate Update Tool',
  description:
    'Professional Telegram-formatted Approval Rate (AR) update generator for MID optimization tracking. Generate reports with threshold-based PERFORMING/LOW classification, daily summaries, and detailed MID analytics.',
  keywords: [
    'approval rate',
    'AR optimization',
    'MID optimization',
    'payment processing',
    'merchant analytics',
    'telegram reporting',
    'sales tracking',
    'decline tracking',
    'payment gateway',
  ],
  authors: [{ name: 'Sagestone Inc' }],
  creator: 'Sagestone Inc',
  publisher: 'Sagestone Inc',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'AR MID Optimization Generator',
    description:
      'Generate professional Telegram-formatted Approval Rate updates for MID optimization tracking with threshold-based analytics.',
    siteName: 'AR MID Optimization Generator',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AR MID Optimization Generator',
    description: 'Professional AR update generator for MID optimization tracking',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#3B82F6',
};

import Navbar from '@/components/Navbar';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans bg-gray-50 antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
