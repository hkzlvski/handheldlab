// app/games/[slug]/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'

import { createClient } from '@/lib/supabase/server'
import ReportCard, {
  type ReportCardData,
} from '@/components/features/ReportCard'
import SortSelect from '@/components/features/SortSelect'

type SortKey = 'helpful' | 'newest' | 'fps' | 'tdp'

type PageProps = {
  params: { slug: string } | Promise<{ slug: string }>
  searchParams?:
    | { device?: string; sort?: SortKey; page?: string }
    | Promise<{ device?: string; sort?: SortKey; page?: string }>
}

const PAGE_SIZE = 12

type GameRow = {
  id: string
  name: string
  slug: string
  steam_app_id: number | null
}

type DeviceRow = {
  id: string
  name: string
  slug: string
  sort_order: number
}

type ReportRow = {
  id: string
  game_id: string
  device_id: string
  user_id: string | null
  created_at: string
  verification_status: 'pending' | 'verified' | 'rejected'
  rejection_reason: string | null
  fps_average: number
  fps_min: number | null
  fps_max: number | null
  tdp_watts: number
  resolution: string
  graphics_preset: string
  proton_version: string | null
  additional_notes: string | null
  screenshot_storage_path: string | null
  upvotes: number
}

type PublicProfileRow = { id: string; username: string }
type VoteRow = { report_id: string }

function sortToOrder(sort?: string) {
  switch (sort) {
    case 'newest':
      return { column: 'created_at' as const, ascending: false }
    case 'fps':
      return { column: 'fps_average' as const, ascending: false }
    case 'tdp':
      return { column: 'tdp_watts' as const, ascending: true }
    case 'helpful':
    default:
      return { column: 'upvotes' as const, ascending: false }
  }
}

function buildQueryString(
  base: Record<string, string | undefined>,
  patch: Record<string, string | undefined>
) {
  const next = { ...base, ...patch }
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(next)) {
    if (v !== undefined && v !== '') sp.set(k, v)
  }
  const s = sp.toString()
  return s ? `?${s}` : ''
}

/**
 * ✅ shared fetch (dedup) for page + metadata
 */
const getApprovedGameBySlug = cache(async (slug: string) => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('games')
    .select('id,name,slug,steam_app_id')
    .eq('slug', slug)
    .eq('status', 'approved')
    .limit(1)

  if (error) console.error('getApprovedGameBySlug error:', error)
  return (data?.[0] ?? null) as GameRow | null
})

/**
 * SEO: dynamic metadata per game slug (C.2.1)
 */
export async function generateMetadata({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>
}): Promise<Metadata> {
  const p = await Promise.resolve(params)
  const slug = p.slug

  const game = await getApprovedGameBySlug(slug)

  if (!game) {
    return {
      title: 'Game not found',
      description: 'This game is not available.',
      robots: { index: false, follow: false },
    }
  }

  // NOTE: layout has template "%s • HandheldLab" → tutaj NIE dodajemy "HandheldLab"
  const title = `${game.name} performance reports`
  const description = `Real handheld performance reports for ${game.name}: verified FPS, settings, TDP, and proof screenshots.`

  return {
    title,
    description,
    alternates: {
      canonical: `/games/${game.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `/games/${game.slug}`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function GamePage(props: PageProps) {
  // ✅ Next 15: params/searchParams mogą być Promise → unwrap
  const { params, searchParams } = props
  const p = await Promise.resolve(params)
  const sp = await Promise.resolve(searchParams ?? {})

  const slug = p.slug
  const deviceSlug = sp.device ?? ''
  const sort: SortKey = sp.sort ?? 'helpful'
  const page = Math.max(1, Number(sp.page ?? '1') || 1)

  const supabase = await createClient()

  // 1) game (deduped with metadata)
  const game = await getApprovedGameBySlug(slug)
  if (!game) notFound()

  // 2) devices
  const { data: devicesData, error: devicesErr } = await supabase
    .from('devices')
    .select('id,name,slug,sort_order')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (devicesErr) console.error('Devices fetch error:', devicesErr)
  const devices = (devicesData ?? []) as DeviceRow[]

  // 3) device filter (jeśli slug nie pasuje → ignorujemy filtr)
  let deviceId: string | null = null
  if (deviceSlug) {
    const found = devices.find((d) => d.slug === deviceSlug)
    deviceId = found ? found.id : null
  }

  // 3.5) total count (real, pod pagination + "X reports")
  let countQuery = supabase
    .from('performance_reports')
    .select('id', { count: 'exact', head: true })
    .eq('game_id', game.id)
    .eq('verification_status', 'verified')

  if (deviceId) countQuery = countQuery.eq('device_id', deviceId)

  const { count: totalCount, error: countErr } = await countQuery
  if (countErr) console.error('Reports count error:', countErr)
  const total = totalCount ?? 0

  // 4) reports + pagination
  const { column, ascending } = sortToOrder(sort)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let reportsQuery = supabase
    .from('performance_reports')
    .select(
      [
        'id',
        'game_id',
        'device_id',
        'user_id',
        'created_at',
        'verification_status',
        'rejection_reason',
        'fps_average',
        'fps_min',
        'fps_max',
        'tdp_watts',
        'resolution',
        'graphics_preset',
        'proton_version',
        'additional_notes',
        'screenshot_storage_path',
        'upvotes',
      ].join(',')
    )
    .eq('game_id', game.id)
    .eq('verification_status', 'verified')
    .order(column, { ascending })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (deviceId) reportsQuery = reportsQuery.eq('device_id', deviceId)

  const { data: reportsData, error: reportsErr } = await reportsQuery
  if (reportsErr) console.error('Reports fetch error:', reportsErr)

  const reportRows = (reportsData ?? []) as unknown as ReportRow[]

  // ✅ B.3.3: vote state for logged user (so after F5 UI is correct)
  const { data: authData, error: authErr } = await supabase.auth.getUser()
  if (authErr) console.error('Auth getUser error:', authErr)
  const userId = authData.user?.id ?? null

  const votedSet = new Set<string>()
  if (userId && reportRows.length > 0) {
    const reportIds = reportRows.map((r) => r.id)

    const { data: votesData, error: votesErr } = await supabase
      .from('performance_votes')
      .select('report_id')
      .eq('user_id', userId)
      .in('report_id', reportIds)

    if (votesErr) console.error('Votes fetch error:', votesErr)

    for (const v of (votesData ?? []) as VoteRow[]) {
      if (v?.report_id) votedSet.add(v.report_id)
    }
  }

  // 5) author map (anon-safe)
  const userIds = Array.from(
    new Set(reportRows.map((r) => r.user_id).filter(Boolean))
  ) as string[]

  const usernameById = new Map<string, string>()
  if (userIds.length > 0) {
    const { data: profilesData, error: profilesErr } = await supabase
      .from('public_profiles')
      .select('id,username')
      .in('id', userIds)

    if (profilesErr) console.error('Profiles fetch error:', profilesErr)
    for (const pr of (profilesData ?? []) as PublicProfileRow[]) {
      usernameById.set(pr.id, pr.username)
    }
  }

  // 6) device name map
  const deviceNameById = new Map<string, string>()
  for (const d of devices) deviceNameById.set(d.id, d.name)

  // 7) signed urls + cards
  const cards: ReportCardData[] = await Promise.all(
    reportRows.map(async (r) => {
      let screenshotUrl: string | null = null

      if (r.screenshot_storage_path) {
        const { data, error } = await supabase.storage
          .from('proofs')
          .createSignedUrl(r.screenshot_storage_path, 60 * 60)

        if (!error) screenshotUrl = data?.signedUrl ?? null
      }

      const username =
        r.user_id && usernameById.get(r.user_id)
          ? `@${usernameById.get(r.user_id)}`
          : '@[deleted]'

      return {
        id: r.id,
        created_at: r.created_at,
        username,
        deviceName: deviceNameById.get(r.device_id) ?? 'Unknown device',
        screenshotUrl,
        upvotes: r.upvotes ?? 0,
        voted: votedSet.has(r.id),
        fps_average: r.fps_average,
        fps_min: r.fps_min,
        fps_max: r.fps_max,
        tdp_watts: r.tdp_watts,
        resolution: r.resolution,
        graphics_preset: r.graphics_preset,
        proton_version: r.proton_version,
        additional_notes: r.additional_notes,
      }
    })
  )

  const steamLink =
    game.steam_app_id && Number(game.steam_app_id) > 0
      ? `https://store.steampowered.com/app/${game.steam_app_id}`
      : null

  const hasMore = page * PAGE_SIZE < total

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-3xl font-semibold text-gray-900">{game.name}</h1>

          <div className="flex items-center gap-3">
            {steamLink && (
              <a
                href={steamLink}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View on Steam →
              </a>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-600">
          {total} report{total === 1 ? '' : 's'}
          {deviceSlug ? ' (filtered)' : ''}
        </p>
      </div>

      {/* Controls */}
      <div className="mt-8 flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
        {/* Device pills */}
        <div className="flex flex-wrap gap-2">
          <Link
            href={buildQueryString({ sort, page: '1' }, { device: undefined })}
            className={[
              'rounded-full border px-3 py-1 text-sm',
              deviceSlug
                ? 'border-gray-200 text-gray-700 hover:bg-gray-50'
                : 'border-gray-900 bg-gray-900 text-white',
            ].join(' ')}
          >
            All devices
          </Link>

          {devices.map((d) => {
            const active = deviceSlug === d.slug
            return (
              <Link
                key={d.id}
                href={buildQueryString({ sort, page: '1' }, { device: d.slug })}
                className={[
                  'rounded-full border px-3 py-1 text-sm',
                  active
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50',
                ].join(' ')}
              >
                {d.name}
              </Link>
            )
          })}
        </div>

        {/* Sort dropdown (client) */}
        <SortSelect device={deviceSlug} sort={sort} />
      </div>

      {/* Grid */}
      <div className="mt-8">
        {cards.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-10 text-center">
            <div className="text-lg font-semibold text-gray-900">
              No verified reports yet
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Be the first to submit a report for this game.
            </p>
            <div className="mt-6">
              <Link
                href="/submit"
                className="inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-4 text-sm font-medium text-white hover:bg-black"
              >
                Submit a report
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {cards.map((c) => (
                <ReportCard key={c.id} report={c} />
              ))}
            </div>

            <div className="mt-8 flex items-center justify-center gap-3">
              {page > 1 && (
                <Link
                  className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm hover:bg-gray-50"
                  href={buildQueryString(
                    { device: deviceSlug, sort },
                    { page: String(page - 1) }
                  )}
                >
                  Previous
                </Link>
              )}

              {hasMore && (
                <Link
                  className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm hover:bg-gray-50"
                  href={buildQueryString(
                    { device: deviceSlug, sort },
                    { page: String(page + 1) }
                  )}
                >
                  Load more
                </Link>
              )}
            </div>
          </>
        )}
      </div>

      <div className="mt-10">
        <Link href="/" className="text-sm text-blue-600 hover:text-blue-700">
          ← Back to homepage
        </Link>
      </div>
    </div>
  )
}
