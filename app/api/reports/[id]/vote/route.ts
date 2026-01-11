// app/api/reports/[id]/vote/route.ts
import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

function badRequest(message: string, requestId?: string) {
  return NextResponse.json(
    { ok: false, error: 'bad_request', message, requestId },
    { status: 400 }
  )
}

function unauthorized(message = 'Unauthorized', requestId?: string) {
  return NextResponse.json(
    { ok: false, error: 'unauthorized', message, requestId },
    { status: 401 }
  )
}

function serverError(message = 'Server error', requestId?: string) {
  return NextResponse.json(
    { ok: false, error: 'server_error', message, requestId },
    { status: 500 }
  )
}

// ✅ Service role client (bypasses RLS) — ONLY on server
function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) throw new Error('Missing Supabase env vars')

  return createSupabaseClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

async function recalcAndPersistUpvotes(reportId: string) {
  const admin = createAdminClient()

  // count votes for report
  const { count, error: countErr } = await admin
    .from('performance_votes')
    .select('*', { count: 'exact', head: true })
    .eq('report_id', reportId)

  if (countErr) throw countErr

  const upvotes = Math.max(0, Number(count ?? 0))

  // persist to reports table (optional but recommended)
  const { error: updErr } = await admin
    .from('performance_reports')
    .update({ upvotes })
    .eq('id', reportId)

  if (updErr) throw updErr

  return upvotes
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const requestId = crypto.randomUUID()
  try {
    const { id: reportId } = await ctx.params
    if (!reportId) return badRequest('Missing report id', requestId)

    const supabase = await createClient()

    const { data: auth, error: authErr } = await supabase.auth.getUser()
    if (authErr) return unauthorized('Unauthorized', requestId)
    const userId = auth.user?.id
    if (!userId) return unauthorized('Unauthorized', requestId)

    // idempotent insert
    const { error: upsertErr } = await supabase
      .from('performance_votes')
      .upsert(
        { report_id: reportId, user_id: userId },
        { onConflict: 'report_id,user_id', ignoreDuplicates: true }
      )

    if (upsertErr)
      return serverError('Vote failed. Please try again.', requestId)

    // ✅ authoritative count
    const upvotes = await recalcAndPersistUpvotes(reportId)

    return NextResponse.json({ ok: true, upvotes, voted: true, requestId })
  } catch (e) {
    console.error(e)
    return serverError('Vote failed. Please try again.', requestId)
  }
}

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const requestId = crypto.randomUUID()
  try {
    const { id: reportId } = await ctx.params
    if (!reportId) return badRequest('Missing report id', requestId)

    const supabase = await createClient()

    const { data: auth, error: authErr } = await supabase.auth.getUser()
    if (authErr) return unauthorized('Unauthorized', requestId)
    const userId = auth.user?.id
    if (!userId) return unauthorized('Unauthorized', requestId)

    const { error: delErr } = await supabase
      .from('performance_votes')
      .delete()
      .eq('report_id', reportId)
      .eq('user_id', userId)

    if (delErr) return serverError('Vote failed. Please try again.', requestId)

    const upvotes = await recalcAndPersistUpvotes(reportId)

    return NextResponse.json({ ok: true, upvotes, voted: false, requestId })
  } catch (e) {
    console.error(e)
    return serverError('Vote failed. Please try again.', requestId)
  }
}
