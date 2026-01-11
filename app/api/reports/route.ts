// app/api/reports/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { reportBaseSchema } from '@/lib/validations/report'

function jsonError(
  status: number,
  payload: Record<string, unknown>,
  requestId: string
) {
  return NextResponse.json({ ok: false, requestId, ...payload }, { status })
}

function asString(v: FormDataEntryValue | null): string | undefined {
  if (v === null) return undefined
  if (typeof v === 'string') {
    const t = v.trim()
    return t === '' ? undefined : t
  }
  // File -> not a string
  return undefined
}

function asFile(v: FormDataEntryValue | null): File | undefined {
  if (v === null) return undefined
  if (typeof v === 'string') return undefined
  // In Next route handlers, fd.get('x') returns a File instance for file inputs
  return v as File
}

async function uploadProof(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  file: File,
  requestId: string
) {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const safeExt = ext.match(/^[a-z0-9]+$/) ? ext : 'jpg'
  const path = `${userId}/${Date.now()}-${crypto.randomUUID()}.${safeExt}`

  const { error } = await supabase.storage.from('proofs').upload(path, file, {
    contentType: file.type || undefined,
    upsert: false,
  })

  if (error) {
    console.error(`[${requestId}] storage upload error:`, error)
    throw new Error('upload_failed')
  }

  return path
}

export async function POST(req: Request) {
  const requestId = crypto.randomUUID()

  try {
    // 1) content-type guard
    const ct = req.headers.get('content-type') || ''
    if (!ct.includes('multipart/form-data')) {
      return jsonError(
        400,
        { error: 'bad_request', message: 'Expected multipart/form-data' },
        requestId
      )
    }

    // 2) auth
    const supabase = await createClient()
    const { data: auth, error: authErr } = await supabase.auth.getUser()

    if (authErr) {
      console.error(`[${requestId}] auth error:`, authErr)
      return jsonError(
        401,
        { error: 'unauthorized', message: 'Unauthorized' },
        requestId
      )
    }

    const userId = auth.user?.id
    if (!userId) {
      return jsonError(
        401,
        { error: 'unauthorized', message: 'Unauthorized' },
        requestId
      )
    }

    // 3) formdata
    const fd = await req.formData()

    // DEBUG: zobacz jakie klucze faktycznie przychodzą
    console.log(`[${requestId}] /api/reports keys:`, Array.from(fd.keys()))

    // 4) map -> payload dla Zod
    const payload = {
      game_id: asString(fd.get('game_id')),
      device_id: asString(fd.get('device_id')),
      fps_average: asString(fd.get('fps_average')) ?? fd.get('fps_average'),
      fps_min: asString(fd.get('fps_min')) ?? fd.get('fps_min'),
      fps_max: asString(fd.get('fps_max')) ?? fd.get('fps_max'),
      tdp_watts: asString(fd.get('tdp_watts')) ?? fd.get('tdp_watts'),
      resolution: asString(fd.get('resolution')),
      graphics_preset: asString(fd.get('graphics_preset')),
      proton_version: asString(fd.get('proton_version')) ?? '',
      additional_notes: asString(fd.get('additional_notes')) ?? '',
      screenshot: asFile(fd.get('screenshot')),
    }

    // 5) validate
    const parsed = reportBaseSchema.safeParse(payload)
    if (!parsed.success) {
      console.error(`[${requestId}] validation issues:`, parsed.error.issues)
      return jsonError(
        400,
        {
          error: 'validation_failed',
          message: 'Validation failed',
          issues: parsed.error.issues,
        },
        requestId
      )
    }

    const data = parsed.data

    // 6) upload (optional)
    let screenshot_storage_path: string | null = null
    if (data.screenshot) {
      screenshot_storage_path = await uploadProof(
        supabase,
        userId,
        data.screenshot,
        requestId
      )
    }

    // 7) insert report
    const { data: inserted, error: insErr } = await supabase
      .from('performance_reports')
      .insert({
        game_id: data.game_id,
        device_id: data.device_id,
        user_id: userId, // <<< CRITICAL, inaczej profile nic nie pokaże
        verification_status: 'pending',
        rejection_reason: null,
        fps_average: data.fps_average,
        fps_min: data.fps_min ?? null,
        fps_max: data.fps_max ?? null,
        tdp_watts: data.tdp_watts,
        resolution: data.resolution,
        graphics_preset: data.graphics_preset,
        proton_version: data.proton_version ?? null,
        additional_notes: data.additional_notes ?? null,
        screenshot_storage_path,
      })
      .select('id')
      .single()

    if (insErr) {
      console.error(`[${requestId}] insert error:`, insErr)
      return jsonError(
        500,
        { error: 'server_error', message: 'Insert failed' },
        requestId
      )
    }

    return NextResponse.json(
      { ok: true, requestId, reportId: inserted.id },
      { status: 200 }
    )
  } catch (e) {
    console.error(`[${requestId}] fatal error:`, e)
    return jsonError(
      500,
      { error: 'server_error', message: 'Request failed' },
      requestId
    )
  }
}
