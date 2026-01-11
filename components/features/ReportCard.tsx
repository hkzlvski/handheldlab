// components/features/ReportCard.tsx
'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import ScreenshotModal from '@/components/features/ScreenshotModal'

export type ReportCardData = {
  id: string
  created_at: string
  username: string
  deviceName: string
  screenshotUrl: string | null
  upvotes: number
  fps_average: number
  fps_min: number | null
  fps_max: number | null
  tdp_watts: number
  resolution: string
  graphics_preset: string
  proton_version: string | null
  additional_notes: string | null
}

export default function ReportCard({ report }: { report: ReportCardData }) {
  const [open, setOpen] = useState(false)

  const fpsLabel = useMemo(() => {
    // proste badge; kolory poprawimy w dark theme później
    if (report.fps_average >= 60) return 'Excellent'
    if (report.fps_average >= 40) return 'Good'
    if (report.fps_average >= 30) return 'Playable'
    return 'Rough'
  }, [report.fps_average])

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {/* Screenshot */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative block w-full bg-gray-50"
          aria-label="Open report details"
        >
          <div className="relative aspect-video w-full">
            {report.screenshotUrl ? (
              <Image
                src={report.screenshotUrl}
                alt="Screenshot"
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
                No screenshot
              </div>
            )}
          </div>

          {/* FPS badge */}
          <div className="absolute left-3 top-3 rounded-md bg-white/90 px-2 py-1 text-xs font-semibold text-gray-900">
            {report.fps_average} FPS • {fpsLabel}
          </div>
        </button>

        {/* Body */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-gray-900">
                {report.deviceName}
              </div>
              <div className="mt-1 text-xs text-gray-600">
                {report.username}
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-gray-500">Upvotes</div>
              <div className="text-sm font-semibold text-gray-900">
                {report.upvotes}
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-md border border-gray-200 px-2 py-2">
              <div className="text-gray-500">TDP</div>
              <div className="font-semibold text-gray-900">
                {report.tdp_watts}W
              </div>
            </div>

            <div className="rounded-md border border-gray-200 px-2 py-2">
              <div className="text-gray-500">Resolution</div>
              <div className="font-semibold text-gray-900">
                {report.resolution}
              </div>
            </div>

            <div className="rounded-md border border-gray-200 px-2 py-2">
              <div className="text-gray-500">Preset</div>
              <div className="font-semibold text-gray-900">
                {report.graphics_preset}
              </div>
            </div>

            <div className="rounded-md border border-gray-200 px-2 py-2">
              <div className="text-gray-500">FPS min/max</div>
              <div className="font-semibold text-gray-900">
                {report.fps_min ?? '—'} / {report.fps_max ?? '—'}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 flex items-center justify-between">
            {/* Upvote button placeholder (B.3) */}
            <button
              type="button"
              className="rounded-md border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
              disabled
              title="Upvoting comes next (B.3)"
            >
              Upvote (soon)
            </button>

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              View Details →
            </button>
          </div>
        </div>
      </div>

      <ScreenshotModal
        open={open}
        onClose={() => setOpen(false)}
        report={report}
      />
    </>
  )
}
