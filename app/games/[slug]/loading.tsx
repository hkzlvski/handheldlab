// app/games/[slug]/loading.tsx
export default function LoadingGamePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      {/* Header skeleton */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="h-9 w-64 rounded-md bg-gray-200" />
          <div className="h-5 w-28 rounded-md bg-gray-200" />
        </div>
        <div className="h-4 w-40 rounded-md bg-gray-200" />
      </div>

      {/* Controls skeleton */}
      <div className="mt-8 flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 w-24 rounded-full bg-gray-200" />
          ))}
        </div>
        <div className="h-10 w-44 rounded-md bg-gray-200" />
      </div>

      {/* Grid skeleton */}
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white"
          >
            <div className="aspect-video w-full bg-gray-200" />
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="h-4 w-36 rounded-md bg-gray-200" />
                  <div className="h-3 w-24 rounded-md bg-gray-200" />
                </div>
                <div className="h-8 w-16 rounded-md bg-gray-200" />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                {Array.from({ length: 4 }).map((__, j) => (
                  <div
                    key={j}
                    className="h-12 rounded-md border border-gray-200 bg-gray-50"
                  />
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="h-9 w-28 rounded-md bg-gray-200" />
                <div className="h-4 w-20 rounded-md bg-gray-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
