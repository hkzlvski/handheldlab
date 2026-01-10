// app/page.tsx
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-24">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">HandheldLab</h1>
        <p className="mb-8 text-lg text-gray-600">
          Performance database for handheld gaming PCs
        </p>
        <div className="rounded-lg bg-white p-8 shadow-md">
          <p className="text-gray-700">
            🚧 <strong>Phase 0 Complete</strong> - Project scaffolding ready
          </p>
          <p className="mt-4 text-sm text-gray-600">
            Next: Phase A - Foundation (Database, Auth, Layout)
          </p>
        </div>
      </div>
    </main>
  )
}
