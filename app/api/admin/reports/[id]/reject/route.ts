// app/api/admin/reports/[id]/reject/route.ts
import { NextResponse, type NextRequest } from 'next/server'
import { randomUUID } from 'crypto'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const rejectSchema = z
  .object({
    reason: z.enum([
      'invalid_screenshot',
      'unrealistic_data',
      'duplicate',
      'other',
    ]),
    customReason: z.string().trim().max(500).optional(),
  })
  .refine((d) => d.reason !== 'other' || !!d.customReason, {
    message: 'Custom reason required when reason is "other"',
    path: ['customReason'],
  })

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const requestId = randomUUID()

  try {
    const { id: reportId } = await ctx.params
    if (!reportId) {
      return NextResponse.json(
        { ok: false, message: 'Missing report id', requestId },
        { status: 400 }
      )
    }

    const body = await req.json().catch(() => null)
    const parsed = rejectSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Validation failed',
          requestId,
          details: parsed.error.issues,
        },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // 1) auth
    const { data: auth, error: authErr } = await supabase.auth.getUser()
    if (authErr) {
      console.error(`[${requestId}] reject auth error`, authErr)
      return NextResponse.json(
        { ok: false, message: 'Unauthorized', requestId },
        { status: 401 }
      )
    }
    const user = auth.user
    if (!user) {
      return NextResponse.json(
        { ok: false, message: 'Unauthorized', requestId },
        { status: 401 }
      )
    }

    // 2) admin check
    const { data: isAdmin, error: adminErr } =
      await supabase.rpc('is_user_admin')
    if (adminErr) {
      console.error(`[${requestId}] reject is_user_admin error`, adminErr)
      return NextResponse.json(
        { ok: false, message: 'Forbidden', requestId },
        { status: 403 }
      )
    }
    if (!isAdmin) {
      return NextResponse.json(
        { ok: false, message: 'Forbidden', requestId },
        { status: 403 }
      )
    }

    const { reason, customReason } = parsed.data
    const rejectionReason =
      reason === 'other' ? (customReason ?? '').trim() : reason

    // 3) update report
    const { data: updated, error: updErr } = await supabase
      .from('performance_reports')
      .update({
        verification_status: 'rejected',
        rejection_reason: rejectionReason,
        moderated_at: new Date().toISOString(),
        moderated_by: user.id,
      })
      .eq('id', reportId)
      .select(
        'id, verification_status, rejection_reason, moderated_at, moderated_by'
      )
      .single()

    if (updErr) {
      console.error(`[${requestId}] reject update error`, updErr)
      return NextResponse.json(
        { ok: false, message: 'Reject failed', requestId },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        ok: true,
        reportId: updated.id,
        status: updated.verification_status,
        rejectionReason: updated.rejection_reason,
        moderatedAt: updated.moderated_at,
        moderatedBy: updated.moderated_by,
        requestId,
      },
      { status: 200 }
    )
  } catch (e) {
    console.error(`[${requestId}] reject unexpected`, e)
    return NextResponse.json(
      { ok: false, message: 'Internal error', requestId },
      { status: 500 }
    )
  }
}
