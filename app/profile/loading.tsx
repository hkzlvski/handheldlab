// app/profile/loading.tsx
export default function LoadingProfilePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      {/* Header skeleton */}
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-gray-200" />
          <div className="space-y-2">
            <div className="h-5 w-36 rounded-md bg-gray-200" />
            <div className="h-4 w-28 rounded-md bg-gray-200" />
          </div>
        </div>
        <div className="h-10 w-40 rounded-md bg-gray-200" />
      </div>

      {/* Sections skeleton */}
      <div className="mt-8 space-y-8">
        {[
          { titleWidth: 120, cards: 2 },
          { titleWidth: 120, cards: 1 },
          { titleWidth: 120, cards: 1 },
        ].map((s, idx) => (
          <section key={idx}>
            <div className="mb-3 flex items-center justify-between">
              <div
                className="h-5 rounded-md bg-gray-200"
                style={{ width: s.titleWidth }}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: s.cards }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-gray-200 bg-white p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="h-4 w-40 rounded-md bg-gray-200" />
                      <div className="h-3 w-32 rounded-md bg-gray-200" />
                    </div>
                    <div className="h-6 w-16 rounded-full bg-gray-200" />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {Array.from({ length: 4 }).map((__, j) => (
                      <div
                        key={j}
                        className="h-12 rounded-md border border-gray-200 bg-gray-50"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
