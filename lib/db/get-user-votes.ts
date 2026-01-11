// lib/db/get-user-votes.ts
import { createClient } from '@/lib/supabase/server'

export async function getUserVotesForReports(
  userId: string,
  reportIds: string[]
) {
  if (reportIds.length === 0) return new Set<string>()

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('performance_votes')
    .select('report_id')
    .eq('user_id', userId)
    .in('report_id', reportIds)

  if (error) {
    console.error('getUserVotesForReports error:', error)
    return new Set<string>()
  }

  return new Set((data ?? []).map((r) => r.report_id as string))
}
