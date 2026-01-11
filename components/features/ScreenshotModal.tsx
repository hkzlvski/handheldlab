// components/features/ScreenshotModal.tsx
'use client'

import * as Dialog from '@radix-ui/react-dialog'
import Image from 'next/image'
import { X } from 'lucide-react'
import type { ReportCardData } from '@/components/features/ReportCard'

type Props = {
  open: boolean
  onClose: () => void
  report: ReportCardData
}

export default function ScreenshotModal({ open, onClose, report }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={(v) => (v ? null : onClose())}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />

        <Dialog.Content
          className={[
            'fixed left-1/2 top-1/2 z-50 w-[min(1000px,calc(100vw-24px))]',
            'max-h-[calc(100vh-24px)] -translate-x-1/2 -translate-y-1/2',
            'overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl outline-none',
          ].join(' ')}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-gray-200 p-4">
            <div>
              <Dialog.Title className="text-sm font-semibold text-gray-900">
                Report details
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-gray-600">
                {report.deviceName} • {report.username}
              </Dialog.Description>
            </div>

            <Dialog.Close asChild>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 hover:bg-gray-50"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
            {/* Screenshot */}
            <div className="border-b border-gray-200 bg-gray-50 md:border-b-0 md:border-r">
              <div className="relative aspect-video w-full">
                {report.screenshotUrl ? (
                  <Image
                    src={report.screenshotUrl}
                    alt="Screenshot"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
                    No screenshot
                  </div>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-md border border-gray-200 p-3">
                  <div className="text-gray-500">FPS avg</div>
                  <div className="mt-1 text-sm font-semibold text-gray-900">
                    {report.fps_average}
                  </div>
                </div>

                <div className="rounded-md border border-gray-200 p-3">
                  <div className="text-gray-500">FPS min / max</div>
                  <div className="mt-1 text-sm font-semibold text-gray-900">
                    {report.fps_min ?? '—'} / {report.fps_max ?? '—'}
                  </div>
                </div>

                <div className="rounded-md border border-gray-200 p-3">
                  <div className="text-gray-500">TDP</div>
                  <div className="mt-1 text-sm font-semibold text-gray-900">
                    {report.tdp_watts}W
                  </div>
                </div>

                <div className="rounded-md border border-gray-200 p-3">
                  <div className="text-gray-500">Resolution</div>
                  <div className="mt-1 text-sm font-semibold text-gray-900">
                    {report.resolution}
                  </div>
                </div>

                <div className="col-span-2 rounded-md border border-gray-200 p-3">
                  <div className="text-gray-500">Graphics preset</div>
                  <div className="mt-1 text-sm font-semibold text-gray-900">
                    {report.graphics_preset}
                  </div>
                </div>

                <div className="col-span-2 rounded-md border border-gray-200 p-3">
                  <div className="text-gray-500">Proton version</div>
                  <div className="mt-1 text-sm font-semibold text-gray-900">
                    {report.proton_version ?? '—'}
                  </div>
                </div>

                <div className="col-span-2 rounded-md border border-gray-200 p-3">
                  <div className="text-gray-500">Additional notes</div>
                  <div className="mt-1 text-sm text-gray-900">
                    {report.additional_notes ?? '—'}
                  </div>
                </div>

                <div className="col-span-2 text-[11px] text-gray-500">
                  Report ID: <span className="font-mono">{report.id}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-10 rounded-md bg-gray-900 px-4 text-sm font-medium text-white hover:bg-black"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
