// app/submit/page.tsx
import type { Metadata } from 'next'
import SubmitPageClient from './SubmitPageClient'

export const metadata: Metadata = {
  // layout template: "%s • HandheldLab" → tu bez "HandheldLab"
  title: 'Submit report',
  description:
    'Submit a handheld performance report with settings and optional proof screenshot.',
  alternates: { canonical: '/submit' },
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: 'Submit report',
    description:
      'Submit a handheld performance report with settings and optional proof screenshot.',
    url: '/submit',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Submit report',
    description:
      'Submit a handheld performance report with settings and optional proof screenshot.',
  },
}

export default function SubmitPage() {
  return <SubmitPageClient />
}
