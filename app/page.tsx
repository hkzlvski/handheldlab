// app/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

type Game = { id: string; name: string; slug: string }

export const metadata: Metadata = {
  // NOTE: layout has template "%s • HandheldLab" → tutaj bez "HandheldLab"
  title: 'Handheld performance database',
  description:
    'Browse real-world performance reports for handheld gaming PCs. Verified FPS, settings, battery usage, and proof screenshots.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    title: 'Handheld performance database',
    description:
      'Find the best settings for games on Steam Deck, ROG Ally, Legion Go and other handheld gaming PCs.',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Handheld performance database',
    description:
      'Find the best settings for games on Steam Deck, ROG Ally, Legion Go and other handheld gaming PCs.',
  },
}

export default async function HomePage() {
  const supabase = await createClient()

  const { data: games } = await supabase
    .from('games')
    .select('id,name,slug')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(12)

  return (
    <div className="space-y-10">
      <section className="rounded-xl border border-gray-200 bg-white p-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Find the perfect settings for your handheld
        </h1>
        <p className="mt-2 text-gray-600">
          Browse real performance reports with settings + proof. No vibes. Just
          data.
        </p>
        <div className="mt-5 flex gap-3">
          <Link
            className="rounded-md bg-primary-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-primary-700"
            href="/games"
          >
            Browse games
          </Link>
          <Link
            className="rounded-md border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            href="/submit"
          >
            Submit report
          </Link>
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Popular games</h2>
          <Link
            className="text-sm text-primary-600 hover:text-primary-700"
            href="/games"
          >
            View all
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {(games ?? []).map((g: Game) => (
            <Link
              key={g.id}
              href={`/games/${g.slug}`}
              className="rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50"
            >
              <div className="font-medium text-gray-900">{g.name}</div>
              <div className="mt-1 text-xs text-gray-500">/games/{g.slug}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
