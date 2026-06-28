import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

export const metadata: Metadata = {
  title: 'your amigo',
  description: 'mission-based operating system for founders. assign missions. wake up to progress.',
  metadataBase: new URL('https://youramigo.co'),
  openGraph: {
    title: 'your amigo',
    description: 'your startup kept moving while you slept.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="overflow-hidden">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
