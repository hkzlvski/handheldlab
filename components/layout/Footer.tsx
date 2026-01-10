// components/layout/Footer.tsx
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} HandheldLab. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm">
            <Link className="text-gray-600 hover:text-gray-900" href="/about">
              About
            </Link>
            <Link className="text-gray-600 hover:text-gray-900" href="/contact">
              Contact
            </Link>
            <Link className="text-gray-600 hover:text-gray-900" href="/privacy">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
