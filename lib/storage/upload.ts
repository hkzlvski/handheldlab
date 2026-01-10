// lib/storage/upload.ts
import type { SupabaseClient } from '@supabase/supabase-js'

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED_MIME = new Set(['image/png', 'image/jpeg', 'image/webp'])

function getExt(mime: string) {
  if (mime === 'image/png') return 'png'
  if (mime === 'image/jpeg') return 'jpg'
  if (mime === 'image/webp') return 'webp'
  return 'bin'
}

function randomId(len = 10) {
  // simple + stable
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let out = ''
  for (let i = 0; i < len; i++)
    out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

export async function uploadProofImage(opts: {
  supabase: SupabaseClient
  userId: string
  file: File
}) {
  const { supabase, userId, file } = opts

  if (!ALLOWED_MIME.has(file.type)) {
    throw new Error('invalid_file_type')
  }
  if (file.size > MAX_BYTES) {
    throw new Error('file_too_large')
  }

  const ext = getExt(file.type)
  const path = `${userId}/${Date.now()}-${randomId()}.${ext}`

  const { error } = await supabase.storage.from('proofs').upload(path, file, {
    contentType: file.type,
    upsert: false,
  })

  if (error) throw error

  return { path }
}
