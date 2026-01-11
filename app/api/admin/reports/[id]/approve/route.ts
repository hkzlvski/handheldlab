// app/api/admin/reports/[id]/approve/route.ts
import { NextResponse, type NextRequest } from 'next/server'
import { randomUUID } from 'crypto'
import { createClient } from '@/lib/supabase/server'

type AdminApproveRpcResponse = {
  report_id: string
  verification_status: 'verified'
  game_approved: boolean
}

export async function POST(
  _req: NextRequest,
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

    const supabase = await createClient()

    // 1) auth
    const { data: auth, error: authErr } = await supabase.auth.getUser()
    if (authErr) {
      console.error(`[${requestId}] approve auth error`, authErr)
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

    // 2) admin check via RPC (user session) — szybciej failujemy po stronie API
    const { data: isAdmin, error: adminErr } =
      await supabase.rpc('is_user_admin')

    if (adminErr) {
      console.error(`[${requestId}] approve is_user_admin error`, adminErr)
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

    // 3) call SQL function admin_approve_report(p_report_id)
    const { data, error } = await supabase.rpc('admin_approve_report', {
      p_report_id: reportId,
    })

    if (error) {
      console.error(`[${requestId}] approve rpc error`, error)
      return NextResponse.json(
        { ok: false, message: error.message || 'Approve failed', requestId },
        { status: 500 }
      )
    }

    // RETURNS jsonb => data jest obiektem (nie tablicą)
    const payload = data as AdminApproveRpcResponse | null

    if (!payload?.report_id) {
      console.error(`[${requestId}] approve rpc invalid payload`, data)
      return NextResponse.json(
        { ok: false, message: 'Approve failed', requestId },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        ok: true,
        reportId: payload.report_id,
        status: payload.verification_status,
        gameApproved: !!payload.game_approved,
        requestId,
      },
      { status: 200 }
    )
  } catch (e) {
    console.error(`[${requestId}] approve unexpected`, e)
    return NextResponse.json(
      { ok: false, message: 'Internal error', requestId },
      { status: 500 }
    )
  }
}
