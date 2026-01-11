// app/admin/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'

import ReviewModal from '@/components/features/ReviewModal'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Admin',
  description: 'Admin verification queue for performance reports.',
  robots: {
    index: false,
    follow: false,
  },
}

type ReportRow = {
  id: string
  game_id: string
  device_id: string
  user_id: string | null
  created_at: string
  verification_status: 'pending' | 'verified' | 'rejected'
  fps_average: number
  fps_min: number | null
  fps_max: number | null
  tdp_watts: number
  resolution: string
  graphics_preset: string
  proton_version: string | null
  additional_notes: string | null
  screenshot_storage_path: string | null
}

type GameRow = { id: string; name: string; slug: string }
type DeviceRow = { id: string; name: string; slug: string }
type PublicProfileRow = { id: string; username: string }

function fmtDateTime(iso: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function safeUsername(username?: string | null) {
  const u = (username ?? '').trim()
  return u ? `@${u}` : '@[deleted]'
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] text-gray-700">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </span>
  )
}

export default async function AdminPage() {
  const supabase = await createClient()

  // 1) auth
  const { data: auth, error: authErr } = await supabase.auth.getUser()
  if (authErr) {
    console.error('Admin auth error:', authErr)
    notFound()
  }
  const user = auth.user
  if (!user) notFound()

  // 2) admin check via RPC (per spec)
  const { data: isAdmin, error: adminErr } = await supabase.rpc('is_user_admin')
  if (adminErr) {
    console.error('is_user_admin RPC error:', adminErr)
    notFound()
  }
  if (!isAdmin) notFound()

  // 3) fetch pending reports (oldest first)
  const { data: reportsData, error: reportsErr } = await supabase
    .from('performance_reports')
    .select(
      [
        'id',
        'game_id',
        'device_id',
        'user_id',
        'created_at',
        'verification_status',
        'fps_average',
        'fps_min',
        'fps_max',
        'tdp_watts',
        'resolution',
        'graphics_preset',
        'proton_version',
        'additional_notes',
        'screenshot_storage_path',
      ].join(',')
    )
    .eq('verification_status', 'pending')
    .order('created_at', { ascending: true })
    .limit(100)

  if (reportsErr) console.error('Admin reports fetch error:', reportsErr)

  const reports = (reportsData ?? []) as unknown as ReportRow[]

  // empty state
  if (reports.length === 0) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
          <div className="text-lg font-semibold text-gray-900">
            No pending reports 🎉
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Nothing to verify right now.
          </p>

          <div className="mt-6">
            <Link
              href="/"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              ← Back to homepage
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // 4) build maps (games, devices, authors)
  const gameIds = Array.from(new Set(reports.map((r) => r.game_id)))
  const deviceIds = Array.from(new Set(reports.map((r) => r.device_id)))
  const userIds = Array.from(
    new Set(reports.map((r) => r.user_id).filter(Boolean))
  ) as string[]

  const gameById = new Map<string, GameRow>()
  const deviceById = new Map<string, DeviceRow>()
  const usernameById = new Map<string, string>()

  if (gameIds.length > 0) {
    const { data, error } = await supabase
      .from('games')
      .select('id,name,slug')
      .in('id', gameIds)

    if (error) console.error('Admin games fetch error:', error)
    for (const g of (data ?? []) as GameRow[]) gameById.set(g.id, g)
  }

  if (deviceIds.length > 0) {
    const { data, error } = await supabase
      .from('devices')
      .select('id,name,slug')
      .in('id', deviceIds)

    if (error) console.error('Admin devices fetch error:', error)
    for (const d of (data ?? []) as DeviceRow[]) deviceById.set(d.id, d)
  }

  if (userIds.length > 0) {
    const { data, error } = await supabase
      .from('public_profiles')
      .select('id,username')
      .in('id', userIds)

    if (error) console.error('Admin public_profiles fetch error:', error)
    for (const p of (data ?? []) as PublicProfileRow[]) {
      usernameById.set(p.id, p.username)
    }
  }

  // 5) signed urls (proofs bucket)
  const rows = await Promise.all(
    reports.map(async (r) => {
      let signedUrl: string | null = null

      if (r.screenshot_storage_path) {
        const { data, error } = await supabase.storage
          .from('proofs')
          .createSignedUrl(r.screenshot_storage_path, 60 * 60)

        if (error) {
          console.error('Signed URL error:', error)
        } else {
          signedUrl = data?.signedUrl ?? null
        }
      }

      const game = gameById.get(r.game_id)
      const device = deviceById.get(r.device_id)

      const username =
        r.user_id && usernameById.get(r.user_id)
          ? safeUsername(usernameById.get(r.user_id))
          : '@[deleted]'

      return { r, game, device, signedUrl, username }
    })
  )

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-gray-900">
          Admin • Verification Queue
        </h1>
        <p className="text-sm text-gray-600">
          Pending reports:{' '}
          <span className="font-semibold">{reports.length}</span>
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="grid grid-cols-12 gap-0 border-b border-gray-200 bg-gray-50 px-4 py-3 text-xs font-semibold text-gray-700">
          <div className="col-span-3">Proof</div>
          <div className="col-span-4">Game / Device</div>
          <div className="col-span-3">Metrics</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        <div className="divide-y divide-gray-200">
          {rows.map(({ r, game, device, signedUrl, username }) => (
            <div key={r.id} className="grid grid-cols-12 gap-0 px-4 py-4">
              {/* proof */}
              <div className="col-span-3 pr-3">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                  {signedUrl ? (
                    <Image
                      src={signedUrl}
                      alt="Proof screenshot"
                      fill
                      className="object-contain"
                      unoptimized
                      sizes="(max-width: 768px) 100vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">
                      No proof
                    </div>
                  )}
                </div>
                <div className="mt-2 text-[11px] text-gray-500">
                  {fmtDateTime(r.created_at)}
                </div>
              </div>

              {/* labels */}
              <div className="col-span-4 pr-3">
                <div className="text-sm font-semibold text-gray-900">
                  {game?.name ?? 'Unknown game'}
                </div>
                <div className="mt-1 text-xs text-gray-600">
                  {device?.name ?? 'Unknown device'} • {username}
                </div>

                {r.proton_version ? (
                  <div className="mt-2 text-[11px] text-gray-600">
                    Proton:{' '}
                    <span className="font-medium">{r.proton_version}</span>
                  </div>
                ) : null}
              </div>

              {/* metrics */}
              <div className="col-span-3 pr-3">
                <div className="flex flex-wrap gap-2">
                  <MetricPill label="FPS avg" value={`${r.fps_average}`} />
                  <MetricPill
                    label="FPS min"
                    value={r.fps_min === null ? '—' : String(r.fps_min)}
                  />
                  <MetricPill
                    label="FPS max"
                    value={r.fps_max === null ? '—' : String(r.fps_max)}
                  />
                  <MetricPill label="TDP" value={`${r.tdp_watts}W`} />
                  <MetricPill label="Res" value={r.resolution} />
                  <MetricPill label="Preset" value={r.graphics_preset} />
                </div>

                {r.additional_notes ? (
                  <div className="mt-3 line-clamp-3 text-xs text-gray-600">
                    {r.additional_notes}
                  </div>
                ) : null}
              </div>

              {/* actions */}
              <div className="col-span-2 flex items-start justify-end">
                <ReviewModal
                  report={r}
                  gameName={game?.name ?? 'Unknown game'}
                  deviceName={device?.name ?? 'Unknown device'}
                  authorLabel={username}
                  signedImageUrl={signedUrl}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <Link href="/" className="text-sm text-blue-600 hover:text-blue-700">
          ← Back to homepage
        </Link>
      </div>
    </div>
  )
}
