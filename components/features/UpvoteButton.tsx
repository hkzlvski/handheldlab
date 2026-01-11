'use client'

import { useState, useTransition } from 'react'

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
}: Props) {
  const [isPending, startTransition] = useTransition()
  const [busy, setBusy] = useState(false) // dodatkowe zabezpieczenie na spam-click

  async function toggle() {
    if (busy) return
    setBusy(true)

    const prev = { count: toSafeInt(count, 0), voted: !!voted }
    const nextVoted = !prev.voted
    const optimisticCount = Math.max(
      0,
      nextVoted ? prev.count + 1 : prev.count - 1
    )

    // optimistic (parent is the source of truth)
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
      // revert to previous
      onChange(prev)
      alert('Vote failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={() => startTransition(() => void toggle())}
      disabled={isPending || busy}
      aria-pressed={voted}
      className={[
        'rounded-md border px-3 py-2 text-xs font-medium',
        voted
          ? 'border-gray-900 bg-gray-900 text-white'
          : 'border-gray-200 text-gray-700 hover:bg-gray-50',
        isPending || busy ? 'opacity-70' : '',
      ].join(' ')}
    >
      Upvote • {toSafeInt(count, 0)}
    </button>
  )
}
