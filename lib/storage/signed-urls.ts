// lib/storage/signed-urls.ts
import { createClient } from '@/lib/supabase/browser'

const CACHE = new Map<string, { url: string; expiresAt: number }>()
const TTL_SECONDS = 60 * 60 // 1h

export async function getSignedProofUrl(path: string): Promise<string | null> {
  const cached = CACHE.get(path)
  const now = Date.now()

  if (cached && cached.expiresAt > now) {
    return cached.url
  }

  const supabase = createClient()

  const { data, error } = await supabase.storage
    .from('proofs')
    .createSignedUrl(path, TTL_SECONDS)

  if (error || !data?.signedUrl) {
    return null
  }

  CACHE.set(path, {
    url: data.signedUrl,
    expiresAt: now + TTL_SECONDS * 1000,
  })

  return data.signedUrl
}
