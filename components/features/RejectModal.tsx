'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { useMemo, useState, type ReactNode } from 'react'

export type RejectReason =
  | 'invalid_screenshot'
  | 'unrealistic_data'
  | 'duplicate'
  | 'other'

export type RejectPayload = {
  reason: RejectReason
  customReason?: string
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: RejectPayload) => void | Promise<void>
  busy?: boolean
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <div className="text-sm font-medium text-gray-900">{children}</div>
}

export default function RejectModal({
  open,
  onOpenChange,
  onSubmit,
  busy,
}: Props) {
  const [reason, setReason] = useState<RejectReason>('invalid_screenshot')
  const [customReason, setCustomReason] = useState('')

  const needsCustom = reason === 'other'
  const canSubmit = useMemo(() => {
    if (!needsCustom) return true
    return customReason.trim().length > 0
  }, [needsCustom, customReason])

  async function submit() {
    if (busy) return
    if (!canSubmit) return

    const payload: RejectPayload =
      reason === 'other'
        ? { reason, customReason: customReason.trim() }
        : { reason }

    await onSubmit(payload)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(520px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gray-200 bg-white shadow-xl">
          <div className="border-b border-gray-200 px-5 py-4">
            <Dialog.Title className="text-base font-semibold text-gray-900">
              Reject report
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-xs text-gray-600">
              Choose a reason (required). If you pick “Other”, add details.
            </Dialog.Description>
          </div>

          <div className="space-y-4 px-5 py-4">
            <div className="space-y-3">
              <FieldLabel>Reason</FieldLabel>

              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="reject_reason"
                  value="invalid_screenshot"
                  checked={reason === 'invalid_screenshot'}
                  onChange={() => setReason('invalid_screenshot')}
                />
                Invalid screenshot
              </label>

              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="reject_reason"
                  value="unrealistic_data"
                  checked={reason === 'unrealistic_data'}
                  onChange={() => setReason('unrealistic_data')}
                />
                Unrealistic data
              </label>

              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="reject_reason"
                  value="duplicate"
                  checked={reason === 'duplicate'}
                  onChange={() => setReason('duplicate')}
                />
                Duplicate report
              </label>

              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="reject_reason"
                  value="other"
                  checked={reason === 'other'}
                  onChange={() => setReason('other')}
                />
                Other
              </label>

              {needsCustom ? (
                <div className="pt-2">
                  <textarea
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                    rows={4}
                    placeholder="Write the rejection reason…"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    disabled={!!busy}
                  />
                  {!canSubmit ? (
                    <p className="mt-1 text-xs text-red-600">
                      Please provide a custom reason.
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => onOpenChange(false)}
                disabled={!!busy}
              >
                Cancel
              </button>

              <button
                type="button"
                className={[
                  'rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black',
                  !canSubmit || busy ? 'cursor-not-allowed opacity-70' : '',
                ].join(' ')}
                onClick={() => void submit()}
                disabled={!canSubmit || !!busy}
              >
                {busy ? 'Rejecting…' : 'Submit rejection'}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
