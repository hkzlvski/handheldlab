'use client'

import { useMemo, useRef, useState } from 'react'

type VoteResponse = {
  ok: boolean
  upvotes: number
  voted: boolean
  requestId?: string
}

type Props = {
  reportId: string
  count: number
  voted: boolean
  onChange: (next: { count: number; voted: boolean }) => void
  onError?: (message: string) => void
}

function toSafeInt(x: unknown, fallback = 0) {
  const n = Number(x)
  if (!Number.isFinite(n)) return fallback
  return Math.max(0, Math.trunc(n))
}

export default function UpvoteButton({
  reportId,
  count,
  voted,
  onChange,
  onError,
}: Props) {
  const safeCount = useMemo(() => toSafeInt(count, 0), [count])

  // UI lock + anti double-submit
  const [busy, setBusy] = useState(false)

  // trzymamy ostatni snapshot żeby zawsze móc revertować do stanu sprzed kliku
  const lastPrevRef = useRef<{ count: number; voted: boolean } | null>(null)

  async function toggle() {
    if (busy) return
    setBusy(true)

    const prev = { count: toSafeInt(count, 0), voted: !!voted }
    lastPrevRef.current = prev

    const nextVoted = !prev.voted
    const optimisticCount = Math.max(
      0,
      nextVoted ? prev.count + 1 : prev.count - 1
    )

    // optimistic update (parent is the source of truth)
    onChange({ count: optimisticCount, voted: nextVoted })

    try {
      const res = await fetch(`/api/reports/${reportId}/vote`, {
        method: nextVoted ? 'POST' : 'DELETE',
      })

      const json = (await res.json()) as VoteResponse
      if (!res.ok || !json.ok) throw new Error('vote_failed')

      onChange({
        count: toSafeInt(json.upvotes, 0),
        voted: !!json.voted,
      })
    } catch {
      // revert do snapshotu sprzed optimistic update
      const revert = lastPrevRef.current ?? prev
      onChange(revert)

      const msg = 'Vote failed. Please try again.'
      if (onError) onError(msg)
      else alert(msg)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      disabled={busy}
      aria-pressed={voted}
      className={[
        'inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium',
        voted
          ? 'border-gray-900 bg-gray-900 text-white'
          : 'border-gray-200 text-gray-700 hover:bg-gray-50',
        busy ? 'cursor-not-allowed opacity-70' : '',
      ].join(' ')}
    >
      {busy ? (
        <>
          <span
            aria-hidden
            className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent"
          />
          Working…
        </>
      ) : (
        <>Upvote • {safeCount}</>
      )}
    </button>
  )
}
