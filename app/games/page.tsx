// app/games/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

type Game = { id: string; name: string; slug: string; status: string }

export const metadata: Metadata = {
  // NOTE: layout has template "%s • HandheldLab" → tutaj bez "HandheldLab"
  title: 'Browse games',
  description:
    'Browse approved games on HandheldLab and open performance reports with settings + proof screenshots.',
  alternates: {
    canonical: '/games',
  },
  openGraph: {
    title: 'Browse games',
    description:
      'Browse approved games on HandheldLab and open performance reports with settings + proof screenshots.',
    url: '/games',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Browse games',
    description:
      'Browse approved games on HandheldLab and open performance reports with settings + proof screenshots.',
  },
}

export default async function GamesPage() {
  const supabase = await createClient()

  const { data: games, error } = await supabase
    .from('games')
    .select('id,name,slug,status')
    .eq('status', 'approved')
    .order('name', { ascending: true })
    .limit(100)

  if (error) {
    console.error('Games page fetch error:', error)
  }

  const list = (games ?? []) as Game[]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Browse games</h1>
      <p className="mt-2 text-gray-600">
        Approved games from the database (MVP list).
      </p>

      {list.length === 0 ? (
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-10 text-center">
          <div className="text-lg font-semibold text-gray-900">
            No approved games yet
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Once games are approved, they will appear here.
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-4 text-sm font-medium text-white hover:bg-black"
            >
              Back to homepage
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {list.map((g) => (
            <Link
              key={g.id}
              href={`/games/${g.slug}`}
              className="rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50"
            >
              <div className="font-medium text-gray-900">{g.name}</div>
              <div className="mt-1 text-xs text-gray-500">{g.slug}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
