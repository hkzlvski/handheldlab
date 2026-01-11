// app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16">
      <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
        <div className="text-sm font-medium text-gray-500">404</div>

        <h1 className="mt-2 text-2xl font-semibold text-gray-900">
          Page not found
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          The page you’re looking for doesn’t exist or was moved.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-4 text-sm font-medium text-white hover:bg-black"
          >
            Back to homepage
          </Link>

          <Link
            href="/games"
            className="inline-flex h-10 items-center justify-center rounded-md border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Browse games
          </Link>
        </div>
      </div>
    </div>
  )
}
