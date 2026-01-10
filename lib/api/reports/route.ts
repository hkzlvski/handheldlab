// app/api/reports/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { handleApiError } from '@/lib/api/error-handler'
import { uploadProofImage } from '@/lib/storage/upload'
import { reportBaseSchema } from '@/lib/validations/report'

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || ''
    if (!contentType.toLowerCase().includes('multipart/form-data')) {
      throw new Error('invalid_content_type')
    }

    const supabase = await createClient()

    // ✅ Auth
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser()

    if (userErr || !user) throw new Error('unauthorized')

    // ✅ Parse multipart
    const form = await req.formData()

    // screenshot optional
    const screenshot = form.get('screenshot')
    const file =
      screenshot instanceof File && screenshot.size > 0 ? screenshot : undefined

    // ✅ Build payload for Zod
    const payload = {
      game_id: String(form.get('game_id') ?? ''),
      device_id: String(form.get('device_id') ?? ''),
      fps_average: Number(form.get('fps_average')),
      fps_min:
        form.get('fps_min') === null || form.get('fps_min') === ''
          ? undefined
          : Number(form.get('fps_min')),
      fps_max:
        form.get('fps_max') === null || form.get('fps_max') === ''
          ? undefined
          : Number(form.get('fps_max')),
      tdp_watts: Number(form.get('tdp_watts')),
      resolution: String(form.get('resolution') ?? ''),
      graphics_preset: String(form.get('graphics_preset') ?? ''),
      proton_version:
        form.get('proton_version') === null || form.get('proton_version') === ''
          ? undefined
          : String(form.get('proton_version')),
      additional_notes:
        form.get('additional_notes') === null ||
        form.get('additional_notes') === ''
          ? undefined
          : String(form.get('additional_notes')),
      screenshot: file, // schema should allow optional
    }

    // ✅ Validate
    const parsed = reportBaseSchema.parse(payload)

    // ✅ Upload (optional)
    let screenshot_storage_path: string | null = null
    if (parsed.screenshot) {
      const { path } = await uploadProofImage({
        supabase,
        userId: user.id,
        file: parsed.screenshot,
      })

      // ✅ CRITICAL verification: enforce prefix
      if (!path.startsWith(`${user.id}/`)) {
        // defensive, should never happen with our helper
        throw new Error('invalid_upload_path')
      }

      // ✅ CRITICAL verification: ensure object exists under current user
      const { data: listed, error: listErr } = await supabase.storage
        .from('proofs')
        .list(user.id, { limit: 100 })

      if (listErr) throw listErr

      const found = (listed ?? []).some((o) => `${user.id}/${o.name}` === path)
      if (!found) {
        throw new Error('upload_verification_failed')
      }

      screenshot_storage_path = path
    }

    // ✅ Insert report (pending)
    const { data: inserted, error: insertErr } = await supabase
      .from('performance_reports')
      .insert({
        game_id: parsed.game_id,
        device_id: parsed.device_id,
        user_id: user.id,
        screenshot_storage_path, // nullable allowed (per your new decision)
        fps_average: parsed.fps_average,
        fps_min: parsed.fps_min ?? null,
        fps_max: parsed.fps_max ?? null,
        tdp_watts: parsed.tdp_watts,
        resolution: parsed.resolution,
        graphics_preset: parsed.graphics_preset,
        proton_version: parsed.proton_version ?? null,
        additional_notes: parsed.additional_notes ?? null,
        verification_status: 'pending',
      })
      .select('id')
      .single()

    if (insertErr) throw insertErr

    return NextResponse.json({ ok: true, reportId: inserted.id })
  } catch (err) {
    const out = handleApiError(err)
    return NextResponse.json(out.body, { status: out.status })
  }
}
