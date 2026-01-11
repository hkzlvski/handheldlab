// app/profile/page.tsx
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

type ProfileRow = {
  id: string
  username: string
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
  tdp_watts: number
  resolution: string
  graphics_preset: string
  upvotes: number
}

type GameRow = { id: string; name: string; slug: string }
type DeviceRow = { id: string; name: string; slug: string }

function initials(username: string) {
  const s = username?.trim() || '?'
  return s.slice(0, 2).toUpperCase()
}

function fmtDate(iso: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    })
  } catch {
    return iso
  }
}

function StatusBadge({ status }: { status: ReportRow['verification_status'] }) {
  const cls =
    status === 'verified'
      ? 'border-green-200 bg-green-50 text-green-800'
      : status === 'pending'
        ? 'border-amber-200 bg-amber-50 text-amber-800'
        : 'border-red-200 bg-red-50 text-red-800'

  const label =
    status === 'verified'
      ? 'Verified'
      : status === 'pending'
        ? 'Pending'
        : 'Rejected'

  return (
    <span
      className={[
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
        cls,
      ].join(' ')}
    >
      {label}
    </span>
  )
}

export default async function ProfilePage() {
  const supabase = await createClient()

  // auth gate (middleware powinien już chronić, ale to jest "belt & suspenders")
  const { data: auth, error: authErr } = await supabase.auth.getUser()
  if (authErr) console.error('Auth getUser error:', authErr)

  const user = auth.user
  if (!user) redirect('/login') // jeśli nie masz /login, zamień na '/'

  // ✅ profile: preferuj public_profiles (to samo co header), fallback do profiles
  let username = 'user'

  const { data: publicProfileRows, error: publicProfileErr } = await supabase
    .from('public_profiles')
    .select('id,username')
    .eq('id', user.id)
    .limit(1)

  if (publicProfileErr) {
    console.error('Public profile fetch error:', publicProfileErr)
  }

  const publicProfile = (publicProfileRows?.[0] ?? null) as ProfileRow | null

  if (publicProfile?.username) {
    username = publicProfile.username
  } else {
    const { data: profileRows, error: profileErr } = await supabase
      .from('profiles')
      .select('id,username')
      .eq('id', user.id)
      .limit(1)

    if (profileErr) console.error('Profile fetch error:', profileErr)

    const profile = (profileRows?.[0] ?? null) as ProfileRow | null
    if (profile?.username) username = profile.username
  }

  // reports (owner-only)
  const { data: reportData, error: reportsErr } = await supabase
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
        'tdp_watts',
        'resolution',
        'graphics_preset',
        'upvotes',
      ].join(',')
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (reportsErr) console.error('Reports fetch error:', reportsErr)

  const reports = (reportData ?? []) as unknown as ReportRow[]

  // maps: games/devices for rendering labels + links
  const gameIds = Array.from(new Set(reports.map((r) => r.game_id)))
  const deviceIds = Array.from(new Set(reports.map((r) => r.device_id)))

  const gameById = new Map<string, GameRow>()
  const deviceById = new Map<string, DeviceRow>()

  if (gameIds.length > 0) {
    const { data: gamesData, error: gamesErr } = await supabase
      .from('games')
      .select('id,name,slug')
      .in('id', gameIds)

    if (gamesErr) console.error('Games fetch error:', gamesErr)
    for (const g of (gamesData ?? []) as GameRow[]) gameById.set(g.id, g)
  }

  if (deviceIds.length > 0) {
    const { data: devicesData, error: devicesErr } = await supabase
      .from('devices')
      .select('id,name,slug')
      .in('id', deviceIds)

    if (devicesErr) console.error('Devices fetch error:', devicesErr)
    for (const d of (devicesData ?? []) as DeviceRow[]) deviceById.set(d.id, d)
  }

  const verified = reports.filter((r) => r.verification_status === 'verified')
  const pending = reports.filter((r) => r.verification_status === 'pending')
  const rejected = reports.filter((r) => r.verification_status === 'rejected')

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
            {initials(username)}
          </div>

          <div>
            <h1 className="text-xl font-semibold text-gray-900">@{username}</h1>
            <p className="mt-1 text-sm text-gray-600">
              Your reports:{' '}
              <span className="font-semibold text-gray-900">
                {reports.length}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/submit"
            className="inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-4 text-sm font-medium text-white hover:bg-black"
          >
            Submit new report
          </Link>
        </div>
      </div>

      {/* Empty state */}
      {reports.length === 0 ? (
        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-10 text-center">
          <div className="text-lg font-semibold text-gray-900">
            No reports yet
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Submit your first performance report to get started.
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
        <div className="mt-8 space-y-8">
          {/* Verified */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">
                Verified{' '}
                <span className="text-gray-500">({verified.length})</span>
              </h2>
            </div>

            {verified.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
                No verified reports yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {verified.map((r) => {
                  const game = gameById.get(r.game_id)
                  const device = deviceById.get(r.device_id)
                  const href = game?.slug ? `/games/${game.slug}` : '#'

                  return (
                    <Link
                      key={r.id}
                      href={href}
                      className="group rounded-xl border border-gray-200 bg-white p-5 hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-gray-900 group-hover:underline">
                            {game?.name ?? 'Unknown game'}
                          </div>
                          <div className="mt-1 text-xs text-gray-600">
                            {device?.name ?? 'Unknown device'} •{' '}
                            {fmtDate(r.created_at)}
                          </div>
                        </div>
                        <StatusBadge status={r.verification_status} />
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-md border border-gray-200 px-2 py-2">
                          <div className="text-gray-500">FPS</div>
                          <div className="font-semibold text-gray-900">
                            {r.fps_average}
                          </div>
                        </div>
                        <div className="rounded-md border border-gray-200 px-2 py-2">
                          <div className="text-gray-500">Upvotes</div>
                          <div className="font-semibold text-gray-900">
                            {r.upvotes ?? 0}
                          </div>
                        </div>
                        <div className="rounded-md border border-gray-200 px-2 py-2">
                          <div className="text-gray-500">TDP</div>
                          <div className="font-semibold text-gray-900">
                            {r.tdp_watts}W
                          </div>
                        </div>
                        <div className="rounded-md border border-gray-200 px-2 py-2">
                          <div className="text-gray-500">Preset</div>
                          <div className="font-semibold text-gray-900">
                            {r.graphics_preset}
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </section>

          {/* Pending */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">
                Pending{' '}
                <span className="text-gray-500">({pending.length})</span>
              </h2>
            </div>

            {pending.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
                No pending reports.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {pending.map((r) => {
                  const game = gameById.get(r.game_id)
                  const device = deviceById.get(r.device_id)
                  const href = game?.slug ? `/games/${game.slug}` : '#'

                  return (
                    <Link
                      key={r.id}
                      href={href}
                      className="group rounded-xl border border-gray-200 bg-white p-5 hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-gray-900 group-hover:underline">
                            {game?.name ?? 'Unknown game'}
                          </div>
                          <div className="mt-1 text-xs text-gray-600">
                            {device?.name ?? 'Unknown device'} •{' '}
                            {fmtDate(r.created_at)}
                          </div>
                        </div>
                        <StatusBadge status={r.verification_status} />
                      </div>

                      <p className="mt-4 text-xs text-gray-600">
                        Waiting for verification. Typically within 24 hours.
                      </p>
                    </Link>
                  )
                })}
              </div>
            )}
          </section>

          {/* Rejected */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">
                Rejected{' '}
                <span className="text-gray-500">({rejected.length})</span>
              </h2>
            </div>

            {rejected.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
                No rejected reports.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {rejected.map((r) => {
                  const game = gameById.get(r.game_id)
                  const device = deviceById.get(r.device_id)
                  const href = game?.slug ? `/games/${game.slug}` : '#'

                  return (
                    <Link
                      key={r.id}
                      href={href}
                      className="group rounded-xl border border-gray-200 bg-white p-5 hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-gray-900 group-hover:underline">
                            {game?.name ?? 'Unknown game'}
                          </div>
                          <div className="mt-1 text-xs text-gray-600">
                            {device?.name ?? 'Unknown device'} •{' '}
                            {fmtDate(r.created_at)}
                          </div>
                        </div>
                        <StatusBadge status={r.verification_status} />
                      </div>

                      <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
                        <div className="font-medium">Reason</div>
                        <div className="mt-1">
                          {r.rejection_reason ?? 'No reason provided.'}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      )}

      <div className="mt-10">
        <Link href="/" className="text-sm text-blue-600 hover:text-blue-700">
          ← Back to homepage
        </Link>
      </div>
    </div>
  )
}
