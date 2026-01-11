// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
  'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),

  title: {
    default: 'HandheldLab',
    template: '%s • HandheldLab',
  },

  description: 'Performance database for handheld gaming PCs',

  alternates: {
    canonical: '/',
  },

  icons: {
    icon: '/favicon.ico',
    // opcjonalnie jak dodasz: public/icon.png
    // apple: '/apple-touch-icon.png',
  },

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    type: 'website',
    url: APP_URL,
    siteName: 'HandheldLab',
    title: 'HandheldLab',
    description: 'Performance database for handheld gaming PCs',
    // images: [{ url: '/og.png', width: 1200, height: 630, alt: 'HandheldLab' }],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'HandheldLab',
    description: 'Performance database for handheld gaming PCs',
    // images: ['/og.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Header />
          <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
