// app/games/[slug]/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16">
      <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Game not found</h1>
        <p className="mt-2 text-sm text-gray-600">
          This game slug doesn&apos;t exist (or isn&apos;t approved yet).
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-4 text-sm font-medium text-white hover:bg-black"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}
