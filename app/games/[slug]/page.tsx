// app/games/[slug]/page.tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import ReportCard, {
  type ReportCardData,
} from '@/components/features/ReportCard'
import SortSelect from '@/components/features/SortSelect'

type SearchParams = {
  device?: string
  sort?: 'helpful' | 'newest' | 'fps' | 'tdp'
  page?: string
}

type Params = { slug: string }

type PageProps = {
  // Next 15: params/searchParams can be Promises in Server Components
  params: Params | Promise<Params>
  searchParams?: SearchParams | Promise<SearchParams>
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

function isPromiseLike<T>(v: unknown): v is Promise<T> {
  return !!v && typeof v === 'object' && 'then' in v
}

export default async function GamePage({ params, searchParams }: PageProps) {
  const supabase = await createClient()

  // ✅ Next 15 fix: unwrap params + searchParams if Promises
  const p = isPromiseLike<Params>(params) ? await params : params
  const sp = searchParams
    ? isPromiseLike<SearchParams>(searchParams)
      ? await searchParams
      : searchParams
    : undefined

  const deviceSlug = sp?.device ?? ''
  const sort = sp?.sort ?? 'helpful'
  const page = Math.max(1, Number(sp?.page ?? '1') || 1)

  // 1) game
  const { data: gameRows, error: gameErr } = await supabase
    .from('games')
    .select('id,name,slug,steam_app_id')
    .eq('slug', p.slug)
    .eq('status', 'approved')
    .limit(1)

  if (gameErr) console.error('Game fetch error:', gameErr)
  const game = (gameRows?.[0] ?? null) as GameRow | null
  if (!game) notFound()

  // 2) devices
  const { data: devicesData, error: devicesErr } = await supabase
    .from('devices')
    .select('id,name,slug,sort_order')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (devicesErr) console.error('Devices fetch error:', devicesErr)
  const devices = (devicesData ?? []) as DeviceRow[]

  // 3) device slug -> device id (jeśli nie istnieje, ignorujemy filtr)
  let deviceId: string | null = null
  if (deviceSlug) {
    const found = devices.find((d) => d.slug === deviceSlug)
    deviceId = found ? found.id : null
  }

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

  // 5) LEFT JOIN author -> public_profiles (anon-safe)
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

  // 6) device id -> name
  const deviceNameById = new Map<string, string>()
  for (const d of devices) deviceNameById.set(d.id, d.name)

  // 7) signed URLs
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

  const totalThisPage = cards.length

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

        {totalThisPage >= 10 && (
          <p className="text-sm text-gray-600">{totalThisPage} reports</p>
        )}
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

              {cards.length === PAGE_SIZE && (
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
