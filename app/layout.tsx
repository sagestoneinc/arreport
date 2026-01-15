import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AR Update Generator',
  description: 'Generate Telegram-formatted Approval Rate updates',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  )
}