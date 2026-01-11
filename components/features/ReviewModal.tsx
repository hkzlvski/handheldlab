'use client'

import * as Dialog from '@radix-ui/react-dialog'
import Image from 'next/image'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import RejectModal, {
  type RejectPayload,
} from '@/components/features/RejectModal'

type ReportRow = {
  id: string
  created_at: string
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

type Props = {
  report: ReportRow
  gameName: string
  deviceName: string
  authorLabel: string
  signedImageUrl: string | null
}

type AdminActionResponse = {
  ok?: boolean
  message?: string
  requestId?: string
}

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

export default function ReviewModal({
  report,
  gameName,
  deviceName,
  authorLabel,
  signedImageUrl,
}: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const flags = useMemo(() => {
    const out: string[] = []
    if (report.fps_average > 200) out.push('⚠️ FPS average > 200')
    if (report.tdp_watts > 30) out.push('⚠️ TDP > 30W')
    // Screenshot <50KB: wymaga HEAD/metadata — zostawiamy na później
    return out
  }, [report.fps_average, report.tdp_watts])

  const fpsMin = report.fps_min === null ? '—' : String(report.fps_min)
  const fpsMax = report.fps_max === null ? '—' : String(report.fps_max)

  async function approve() {
    if (busy) return
    setBusy(true)

    try {
      const res = await fetch(`/api/admin/reports/${report.id}/approve`, {
        method: 'POST',
      })

      const json = (await res.json().catch(() => ({}))) as AdminActionResponse
      if (!res.ok || !json.ok) throw new Error(json.message || 'approve_failed')

      setRejectOpen(false)
      setOpen(false)
      router.refresh()
    } catch (e) {
      console.error(e)
      alert('Approve failed. Check server logs.')
    } finally {
      setBusy(false)
    }
  }

  async function reject(payload: RejectPayload) {
    if (busy) return
    setBusy(true)

    try {
      const res = await fetch(`/api/admin/reports/${report.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = (await res.json().catch(() => ({}))) as AdminActionResponse
      if (!res.ok || !json.ok) throw new Error(json.message || 'reject_failed')

      setRejectOpen(false)
      setOpen(false)
      router.refresh()
    } catch (e) {
      console.error(e)
      alert('Reject failed. Check server logs.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Dialog.Root
        open={open}
        onOpenChange={(v: boolean) => {
          if (busy) return
          setOpen(v)
        }}
      >
        <Dialog.Trigger asChild>
          <button
            type="button"
            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            View
          </button>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />

          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(980px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gray-200 bg-white shadow-xl">
            {/* header */}
            <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4">
              <div>
                <Dialog.Title className="text-base font-semibold text-gray-900">
                  Review report
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-xs text-gray-600">
                  {gameName} • {deviceName} • {authorLabel} •{' '}
                  {fmtDateTime(report.created_at)}
                </Dialog.Description>
              </div>

              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  disabled={busy}
                >
                  Close
                </button>
              </Dialog.Close>
            </div>

            {/* body */}
            <div className="grid grid-cols-1 gap-6 p-5 md:grid-cols-2">
              {/* image */}
              <div className="space-y-3">
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                  <div className="relative aspect-video w-full">
                    {signedImageUrl ? (
                      <Image
                        src={signedImageUrl}
                        alt="Proof screenshot"
                        fill
                        className="object-contain"
                        unoptimized
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
                        No proof uploaded
                      </div>
                    )}
                  </div>
                </div>

                {flags.length > 0 ? (
                  <div className="space-y-2">
                    {flags.map((f) => (
                      <div
                        key={f}
                        className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900"
                      >
                        {f}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500">
                    No sanity flags detected.
                  </div>
                )}
              </div>

              {/* details */}
              <div className="space-y-4">
                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="mb-3 text-sm font-semibold text-gray-900">
                    Metrics
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-md border border-gray-200 px-3 py-2">
                      <div className="text-gray-500">FPS avg</div>
                      <div className="mt-0.5 font-semibold text-gray-900">
                        {report.fps_average}
                      </div>
                    </div>

                    <div className="rounded-md border border-gray-200 px-3 py-2">
                      <div className="text-gray-500">TDP</div>
                      <div className="mt-0.5 font-semibold text-gray-900">
                        {report.tdp_watts}W
                      </div>
                    </div>

                    <div className="rounded-md border border-gray-200 px-3 py-2">
                      <div className="text-gray-500">FPS min</div>
                      <div className="mt-0.5 font-semibold text-gray-900">
                        {fpsMin}
                      </div>
                    </div>

                    <div className="rounded-md border border-gray-200 px-3 py-2">
                      <div className="text-gray-500">FPS max</div>
                      <div className="mt-0.5 font-semibold text-gray-900">
                        {fpsMax}
                      </div>
                    </div>

                    <div className="rounded-md border border-gray-200 px-3 py-2">
                      <div className="text-gray-500">Resolution</div>
                      <div className="mt-0.5 font-semibold text-gray-900">
                        {report.resolution}
                      </div>
                    </div>

                    <div className="rounded-md border border-gray-200 px-3 py-2">
                      <div className="text-gray-500">Preset</div>
                      <div className="mt-0.5 font-semibold text-gray-900">
                        {report.graphics_preset}
                      </div>
                    </div>
                  </div>

                  {report.proton_version ? (
                    <div className="mt-4 text-xs text-gray-700">
                      <span className="text-gray-500">Proton: </span>
                      <span className="font-medium">
                        {report.proton_version}
                      </span>
                    </div>
                  ) : null}
                </div>

                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="mb-2 text-sm font-semibold text-gray-900">
                    Notes
                  </div>
                  {report.additional_notes ? (
                    <p className="whitespace-pre-wrap text-sm text-gray-700">
                      {report.additional_notes}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">No notes.</p>
                  )}
                </div>

                {/* actions */}
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setRejectOpen(true)}
                    className={[
                      'rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50',
                      busy ? 'cursor-not-allowed opacity-70' : '',
                    ].join(' ')}
                    disabled={busy}
                  >
                    {busy ? 'Working…' : 'Reject'}
                  </button>

                  <button
                    type="button"
                    onClick={() => void approve()}
                    className={[
                      'rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black',
                      busy ? 'cursor-not-allowed opacity-70' : '',
                    ].join(' ')}
                    disabled={busy}
                  >
                    {busy ? 'Approving…' : 'Approve'}
                  </button>
                </div>

                <div className="text-[11px] text-gray-500">
                  Report ID: <span className="font-mono">{report.id}</span>
                </div>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <RejectModal
        open={rejectOpen}
        onOpenChange={(v: boolean) => {
          if (busy) return
          setRejectOpen(v)
        }}
        busy={busy}
        onSubmit={reject}
      />
    </>
  )
}
