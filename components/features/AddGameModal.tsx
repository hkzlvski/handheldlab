// components/features/AddGameModal.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/browser'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

type Props = {
  open: boolean
  onClose: () => void
  onCreated: (game: { id: string; name: string; slug: string }) => void
}

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export default function AddGameModal({ open, onClose, onCreated }: Props) {
  const supabase = useMemo(() => createClient(), [])
  const [name, setName] = useState('')
  const [steamAppId, setSteamAppId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setError(null)
    setName('')
    setSteamAppId('')
  }, [open])

  const canSubmit = name.trim().length >= 2 && !isSubmitting

  const submit = async () => {
    setError(null)
    setIsSubmitting(true)

    try {
      const cleanName = name.trim()
      const slug = slugify(cleanName)

      const parsedSteam =
        steamAppId.trim() === '' ? null : Number(steamAppId.trim())

      if (parsedSteam !== null && !Number.isFinite(parsedSteam)) {
        setError('Steam App ID must be a number')
        return
      }

      const { data, error: insertError } = await supabase
        .from('games')
        .insert({
          name: cleanName,
          slug,
          steam_app_id: parsedSteam,
          status: 'pending',
          // submitted_by ustawiane przez RLS check (must be auth.uid())
          // ale w tabeli jest kolumna submitted_by - musimy ją wysłać:
          submitted_by: (await supabase.auth.getUser()).data.user?.id ?? null,
        })
        .select('id,name,slug')
        .single()

      if (insertError) {
        // najczęstsze: unique violations
        const msg = insertError.message.toLowerCase()
        if (msg.includes('duplicate') || msg.includes('unique')) {
          setError(
            'Game already exists (or slug conflict). Try a different name.'
          )
        } else {
          setError(insertError.message)
        }
        return
      }

      onCreated(data)
      onClose()
    } catch (e) {
      console.error(e)
      setError('Unexpected error. Try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* overlay */}
      <button
        aria-label="Close modal"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        type="button"
      />

      {/* modal */}
      <div className="relative w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Add a game</h3>
          <p className="mt-1 text-sm text-gray-600">
            If it’s missing, submit it for approval. It will appear as pending.
          </p>
        </div>

        <div className="space-y-4">
          <Input
            label="Game name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Helldivers 2"
          />

          <Input
            label="Steam App ID (optional)"
            value={steamAppId}
            onChange={(e) => setSteamAppId(e.target.value)}
            placeholder="e.g. 553850"
            inputMode="numeric"
          />

          {error && (
            <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="button"
              onClick={submit}
              disabled={!canSubmit}
              loading={isSubmitting}
            >
              Submit game
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
