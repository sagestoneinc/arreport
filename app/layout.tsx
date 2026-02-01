import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 antialiased`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
