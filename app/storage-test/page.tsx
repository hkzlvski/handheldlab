'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/browser'

export default function StorageTestPage() {
  const [file, setFile] = useState<File | null>(null)
  const [log, setLog] = useState<string>('')

  const upload = async () => {
    setLog('Starting...')
    const supabase = createClient()

    const { data: userData, error: userErr } = await supabase.auth.getUser()
    if (userErr) return setLog(`getUser error: ${userErr.message}`)
    if (!userData.user) return setLog('No user. Log in first.')

    if (!file) return setLog('Pick a file first.')

    const path = `someone-else-id/test-${Date.now()}-${file.name}`

    const { data, error } = await supabase.storage
      .from('proofs')
      .upload(path, file, { upsert: false })

    if (error) return setLog(`UPLOAD ERROR: ${error.message}`)

    setLog(`UPLOAD OK ✅\npath: ${data.path}`)
  }

  const listMine = async () => {
    setLog('Listing...')
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return setLog('No user. Log in first.')

    const { data, error } = await supabase.storage
      .from('proofs')
      .list(userData.user.id, { limit: 20 })

    if (error) return setLog(`LIST ERROR: ${error.message}`)

    setLog(`LIST OK ✅\n${JSON.stringify(data, null, 2)}`)
  }

  return (
    <div style={{ padding: 24, maxWidth: 800 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>Storage Test (proofs)</h1>
      <p>
        Upload should work only to: <code>{`{uid}/...`}</code>
      </p>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />

      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <button onClick={upload} style={{ padding: '8px 12px' }}>
          Upload to my folder
        </button>
        <button onClick={listMine} style={{ padding: '8px 12px' }}>
          List my folder
        </button>
      </div>

      <pre
        style={{
          marginTop: 16,
          background: '#111',
          color: '#eee',
          padding: 12,
          borderRadius: 8,
          whiteSpace: 'pre-wrap',
        }}
      >
        {log}
      </pre>
    </div>
  )
}
