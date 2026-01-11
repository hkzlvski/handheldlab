// app/sitemap.ts
import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'http://localhost:3000'

type GameRow = { slug: string; updated_at?: string | null }

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('games')
    .select('slug,updated_at')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(5000)

  if (error) {
    console.error('sitemap fetch games error:', error)
  }

  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${APP_URL}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${APP_URL}/games`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ]

  const gameRoutes: MetadataRoute.Sitemap = (data ?? []).map((g: GameRow) => ({
    url: `${APP_URL}/games/${g.slug}`,
    lastModified: g.updated_at ? new Date(g.updated_at) : now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...gameRoutes]
}
