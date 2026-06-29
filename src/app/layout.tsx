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
    images: [
      {
        url: '/amigo-hero.png',
        width: 1200,
        height: 630,
        alt: 'your amigo hero artwork',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'your amigo',
    description: 'your startup kept moving while you slept.',
    images: ['/amigo-hero.png'],
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
