// app/games/page.tsx
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

type Game = { id: string; name: string; slug: string; status: string }

export default async function GamesPage() {
  const supabase = await createClient()

  const { data: games } = await supabase
    .from('games')
    .select('id,name,slug,status')
    .eq('status', 'approved')
    .order('name', { ascending: true })
    .limit(100)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Browse games</h1>
      <p className="mt-2 text-gray-600">
        Approved games from the database (MVP list).
      </p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {(games ?? []).map((g: Game) => (
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
    </div>
  )
}
