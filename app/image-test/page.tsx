'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/browser'
import { getSignedProofUrl } from '@/lib/storage/signed-urls'

export default function ImageTestPage() {
  const [url, setUrl] = useState<string | null>(null)
  const [log, setLog] = useState('')

  useEffect(() => {
    const run = async () => {
      setLog('Starting...')

      const supabase = createClient()
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        setLog('No user. Log in first.')
        return
      }

      // 1) Listuj pliki w folderze usera
      const { data: files, error: listErr } = await supabase.storage
        .from('proofs')
        .list(data.user.id, { limit: 10 })

      if (listErr) {
        setLog(`LIST ERROR: ${listErr.message}`)
        return
      }

      if (!files || files.length === 0) {
        setLog(
          'No files in your folder. Upload something first on /storage-test.'
        )
        return
      }

      // 2) Weź pierwszy plik i zbuduj path
      // UWAGA: jeśli plik jest w podfolderze (uid/reportId/file),
      // list() zwróci foldery - więc wybieramy pierwszy "file", a nie "folder".
      const firstFile = files.find((f) => f.id) // pliki mają id, foldery często nie
      if (!firstFile) {
        setLog('Found only folders. Open a folder or upload directly to uid/.')
        return
      }

      const path = `${data.user.id}/${firstFile.name}`

      // 3) Signed URL
      const signed = await getSignedProofUrl(path)
      if (!signed) {
        setLog('Could not generate signed URL.')
        return
      }

      setUrl(signed)
      setLog(`OK ✅\npath: ${path}`)
    }

    run()
  }, [])

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>Image Test</h1>
      <pre
        style={{
          marginTop: 12,
          background: '#111',
          color: '#eee',
          padding: 12,
          borderRadius: 8,
        }}
      >
        {log}
      </pre>

      {url ? (
        <div style={{ marginTop: 16 }}>
          <Image
            src={url}
            alt="Proof"
            width={640}
            height={360}
            style={{ borderRadius: 12 }}
          />
        </div>
      ) : null}
    </div>
  )
}
