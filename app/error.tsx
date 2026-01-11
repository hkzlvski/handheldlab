// app/error.tsx
'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Route error:', error)
  }, [error])

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16">
      <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
        <div className="text-sm font-medium text-gray-500">500</div>

        <h1 className="mt-2 text-2xl font-semibold text-gray-900">
          Something went wrong
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          Try again. If the problem persists, check the server logs.
        </p>

        {error?.digest ? (
          <p className="mt-4 text-xs text-gray-500">
            Error digest: <span className="font-mono">{error.digest}</span>
          </p>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-4 text-sm font-medium text-white hover:bg-black"
          >
            Try again
          </button>

          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-md border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Back to homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
