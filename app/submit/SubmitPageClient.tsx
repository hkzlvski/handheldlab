// app/submit/SubmitPageClient.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  useForm,
  useWatch,
  type SubmitHandler,
  type Resolver,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { createClient } from '@/lib/supabase/browser'
import { reportBaseSchema, type ReportFormData } from '@/lib/validations/report'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import AddGameModal from '@/components/features/AddGameModal'

type GameRow = { id: string; name: string; slug: string }
type DeviceRow = { id: string; name: string; slug: string }

type ApiError = {
  requestId?: string
  error?: string
  message?: string
  details?: unknown
} | null

export default function SubmitPageClient() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [games, setGames] = useState<GameRow[]>([])
  const [devices, setDevices] = useState<DeviceRow[]>([])
  const [loadingOptions, setLoadingOptions] = useState(true)

  const [apiError, setApiError] = useState<ApiError>(null)
  const [success, setSuccess] = useState<{ reportId: string } | null>(null)

  // ✅ controlled modal state
  const [isAddGameOpen, setIsAddGameOpen] = useState(false)

  const {
    register,
    setValue,
    handleSubmit,
    control,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<ReportFormData>({
    resolver: zodResolver(
      reportBaseSchema
    ) as unknown as Resolver<ReportFormData>,
    mode: 'onChange',
    defaultValues: {
      tdp_watts: 15,
      resolution: '800p',
      graphics_preset: 'medium',
    },
  })

  const screenshotFile = useWatch({ control, name: 'screenshot' })
  const gameId = useWatch({ control, name: 'game_id' }) ?? ''
  const deviceId = useWatch({ control, name: 'device_id' }) ?? ''
  const tdpWatts = useWatch({ control, name: 'tdp_watts' }) ?? 15
  const resolution = useWatch({ control, name: 'resolution' })
  const graphicsPreset = useWatch({ control, name: 'graphics_preset' })

  const previewUrl = useMemo(() => {
    if (!screenshotFile) return null
    return URL.createObjectURL(screenshotFile)
  }, [screenshotFile])

  useEffect(() => {
    if (!previewUrl) return
    return () => URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  // load dropdown data
  useEffect(() => {
    let cancelled = false

    async function run() {
      setLoadingOptions(true)

      const [
        { data: gamesData, error: gamesError },
        { data: devicesData, error: devicesError },
      ] = await Promise.all([
        supabase
          .from('games')
          .select('id,name,slug')
          .eq('status', 'approved')
          .order('name', { ascending: true }),
        supabase
          .from('devices')
          .select('id,name,slug')
          .eq('is_active', true)
          .order('sort_order', { ascending: true }),
      ])

      if (cancelled) return
      if (gamesError) console.error('Failed to load games', gamesError)
      if (devicesError) console.error('Failed to load devices', devicesError)

      setGames((gamesData ?? []) as GameRow[])
      setDevices((devicesData ?? []) as DeviceRow[])
      setLoadingOptions(false)
    }

    run()
    return () => {
      cancelled = true
    }
  }, [supabase])

  const onSubmit: SubmitHandler<ReportFormData> = async (data) => {
    setApiError(null)

    try {
      const fd = new FormData()

      fd.set('game_id', data.game_id)
      fd.set('device_id', data.device_id)

      fd.set('fps_average', String(data.fps_average))
      if (data.fps_min !== undefined) fd.set('fps_min', String(data.fps_min))
      if (data.fps_max !== undefined) fd.set('fps_max', String(data.fps_max))

      fd.set('tdp_watts', String(data.tdp_watts))
      fd.set('resolution', data.resolution)
      fd.set('graphics_preset', data.graphics_preset)

      if (data.proton_version) fd.set('proton_version', data.proton_version)
      if (data.additional_notes)
        fd.set('additional_notes', data.additional_notes)
      if (data.screenshot) fd.set('screenshot', data.screenshot)

      const res = await fetch('/api/reports', { method: 'POST', body: fd })

      if (!res.ok) {
        let errJson: ApiError = null
        try {
          errJson = (await res.json()) as ApiError
        } catch {
          errJson = { error: 'server_error', message: 'Request failed.' }
        }
        setApiError(errJson)
        return
      }

      const json = (await res.json()) as { ok: true; reportId: string }
      setSuccess({ reportId: json.reportId })

      reset({
        tdp_watts: 15,
        resolution: '800p',
        graphics_preset: 'medium',
      })

      setTimeout(() => {
        router.push('/profile')
        router.refresh()
      }, 1200)
    } catch (e) {
      console.error(e)
      setApiError({
        error: 'network_error',
        message: 'Network error. Please try again.',
      })
    }
  }

  if (success) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16">
        <div className="rounded-xl border border-gray-200 bg-white p-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Report submitted ✅
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Typically verified within 24 hours.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              onClick={() => {
                router.push('/profile')
                router.refresh()
              }}
            >
              Go to profile
            </Button>

            <Button
              variant="secondary"
              onClick={() => {
                setSuccess(null)
                setApiError(null)
              }}
            >
              Submit another
            </Button>
          </div>

          <p className="mt-6 text-xs text-gray-500">
            Report ID: <span className="font-mono">{success.reportId}</span>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Submit report</h1>
        <p className="mt-2 text-sm text-gray-600">
          Add real performance results. Proof is optional now — verification
          happens later.
        </p>
      </div>

      {/* ✅ controlled modal */}
      <AddGameModal
        open={isAddGameOpen}
        onClose={() => setIsAddGameOpen(false)}
        onCreated={(game) => {
          setIsAddGameOpen(false)

          // modal zwraca {id,name,slug} u Ciebie wg błędu TS
          setGames((prev) => {
            const exists = prev.some((g) => g.id === game.id)
            if (exists) return prev
            return [{ id: game.id, name: game.name, slug: game.slug }, ...prev]
          })

          setValue('game_id', game.id, { shouldValidate: true })
        }}
      />

      {apiError?.message && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <div className="font-medium">Submission failed</div>
          <div className="mt-1">{apiError.message}</div>
          {apiError.requestId && (
            <div className="mt-2 text-xs text-red-700/80">
              requestId: <span className="font-mono">{apiError.requestId}</span>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Game */}
        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-gray-900">Game</h2>

            <button
              type="button"
              disabled={isSubmitting}
              className={[
                'text-sm font-medium text-blue-600 hover:text-blue-700',
                isSubmitting ? 'cursor-not-allowed opacity-70' : '',
              ].join(' ')}
              onClick={() => setIsAddGameOpen(true)}
            >
              Can&apos;t find game?
            </button>
          </div>

          <Select
            label="Select game"
            placeholder={loadingOptions ? 'Loading…' : 'Select…'}
            value={gameId}
            onChange={(val) =>
              setValue('game_id', val, { shouldValidate: true })
            }
            options={games.map((g) => ({ value: g.id, label: g.name }))}
            error={errors.game_id?.message}
          />
        </section>

        {/* Device */}
        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-gray-900">Device</h2>

          <Select
            label="Select device"
            placeholder={loadingOptions ? 'Loading…' : 'Select…'}
            value={deviceId}
            onChange={(val) =>
              setValue('device_id', val, { shouldValidate: true })
            }
            options={devices.map((d) => ({ value: d.id, label: d.name }))}
            error={errors.device_id?.message}
          />
        </section>

        {/* Proof */}
        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-2 text-base font-semibold text-gray-900">
            Proof (optional)
          </h2>
          <p className="mb-4 text-sm text-gray-600">
            Upload a screenshot if you have it. (PNG/JPG/WEBP, max 5MB)
          </p>

          <Input
            label="Screenshot"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            error={errors.screenshot?.message as string | undefined}
            onChange={(e) => {
              const file = e.target.files?.[0]
              setValue('screenshot', file, { shouldValidate: true })
            }}
          />

          {previewUrl && (
            <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
              <div className="relative aspect-video w-full bg-gray-50">
                <Image
                  src={previewUrl}
                  alt="Screenshot preview"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            </div>
          )}
        </section>

        {/* Metrics */}
        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-gray-900">
            Performance
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input
              label="FPS average"
              type="number"
              inputMode="numeric"
              error={errors.fps_average?.message}
              {...register('fps_average', {
                valueAsNumber: true,
                setValueAs: (v) =>
                  v === '' || v === null || v === undefined
                    ? undefined
                    : Number(v),
              })}
            />
            <Input
              label="FPS min (optional)"
              type="number"
              inputMode="numeric"
              error={errors.fps_min?.message}
              {...register('fps_min', {
                valueAsNumber: true,
                setValueAs: (v) =>
                  v === '' || v === null || v === undefined
                    ? undefined
                    : Number(v),
              })}
            />
            <Input
              label="FPS max (optional)"
              type="number"
              inputMode="numeric"
              error={errors.fps_max?.message}
              {...register('fps_max', {
                valueAsNumber: true,
                setValueAs: (v) =>
                  v === '' || v === null || v === undefined
                    ? undefined
                    : Number(v),
              })}
            />
          </div>

          <div className="mt-6">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              TDP (Watts): <span className="font-semibold">{tdpWatts}</span>
            </label>

            <input
              type="range"
              min={5}
              max={30}
              step={1}
              className="w-full"
              {...register('tdp_watts', {
                valueAsNumber: true,
                setValueAs: (v) => Number(v),
              })}
            />

            {errors.tdp_watts?.message && (
              <p className="mt-1 text-sm text-red-600">
                {errors.tdp_watts.message}
              </p>
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Select
              label="Resolution"
              value={resolution}
              onChange={(val) =>
                setValue('resolution', val as ReportFormData['resolution'], {
                  shouldValidate: true,
                })
              }
              options={[
                { value: 'native', label: 'native' },
                { value: '1080p', label: '1080p' },
                { value: '900p', label: '900p' },
                { value: '800p', label: '800p' },
                { value: '720p', label: '720p' },
                { value: '540p', label: '540p' },
              ]}
              error={errors.resolution?.message}
            />

            <Select
              label="Graphics preset"
              value={graphicsPreset}
              onChange={(val) =>
                setValue(
                  'graphics_preset',
                  val as ReportFormData['graphics_preset'],
                  {
                    shouldValidate: true,
                  }
                )
              }
              options={[
                { value: 'low', label: 'low' },
                { value: 'medium', label: 'medium' },
                { value: 'high', label: 'high' },
                { value: 'ultra', label: 'ultra' },
                { value: 'custom', label: 'custom' },
              ]}
              error={errors.graphics_preset?.message}
            />
          </div>

          <div className="mt-6">
            <Input
              label="Proton version (optional)"
              placeholder="e.g. Proton Experimental"
              error={errors.proton_version?.message}
              {...register('proton_version', {
                setValueAs: (v) => (v === '' ? undefined : v),
              })}
            />
          </div>

          <div className="mt-6">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Additional notes (optional)
            </label>

            <textarea
              className={[
                'w-full rounded border px-3 py-2 outline-none',
                errors.additional_notes
                  ? 'border-red-300 focus:ring-2 focus:ring-red-200'
                  : 'border-gray-300 focus:ring-2 focus:ring-blue-200',
              ].join(' ')}
              rows={4}
              placeholder="Anything important: stutters, FSR, frame cap, etc."
              {...register('additional_notes', {
                setValueAs: (v) => (v === '' ? undefined : v),
              })}
            />

            {errors.additional_notes?.message && (
              <p className="mt-1 text-sm text-red-600">
                {errors.additional_notes.message}
              </p>
            )}

            <p className="mt-1 text-xs text-gray-500">Max 500 characters.</p>
          </div>
        </section>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="submit"
            variant="primary"
            disabled={!isValid || isSubmitting}
            loading={isSubmitting}
          >
            {isSubmitting ? 'Submitting…' : 'Submit report'}
          </Button>
        </div>
      </form>
    </div>
  )
}
