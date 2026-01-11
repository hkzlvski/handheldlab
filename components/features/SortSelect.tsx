// components/features/SortSelect.tsx
'use client'

import { useRouter } from 'next/navigation'

export default function SortSelect({
  device,
  sort,
}: {
  device: string
  sort: 'helpful' | 'newest' | 'fps' | 'tdp'
}) {
  const router = useRouter()

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">Sort:</span>
      <select
        defaultValue={sort}
        className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
        onChange={(e) => {
          const nextSort = e.target.value
          const sp = new URLSearchParams()
          if (device) sp.set('device', device)
          sp.set('sort', nextSort)
          sp.set('page', '1')
          router.push(`?${sp.toString()}`)
          router.refresh()
        }}
      >
        <option value="helpful">Most Helpful</option>
        <option value="newest">Newest</option>
        <option value="fps">Highest FPS</option>
        <option value="tdp">Lowest TDP</option>
      </select>
    </div>
  )
}
