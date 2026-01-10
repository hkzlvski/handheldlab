// app/games/[slug]/page.tsx
export default async function GamePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        Game page (placeholder)
      </h1>
      <p className="mt-2 text-gray-600">
        Slug: <span className="font-mono text-gray-900">{slug}</span>
      </p>
      <p className="mt-4 text-gray-600">
        Next step (Phase B): show verified reports, filters by device, upvotes
        sorting.
      </p>
    </div>
  )
}
