import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <Link href="/" className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">HandheldLab</h1>
      </Link>

      <div className="w-full max-w-md">{children}</div>

      <p className="mt-8 text-center text-sm text-gray-500">
        Performance database for handheld gaming PCs
      </p>
    </div>
  )
}
