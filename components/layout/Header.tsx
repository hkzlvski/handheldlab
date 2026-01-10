// components/layout/Header.tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/browser'
import { Button } from '@/components/ui/Button'
import { LoginModal } from '@/components/features/LoginModal'
import { SignupModal } from '@/components/features/SignupModal'

export default function Header() {
  const router = useRouter()
  const { user, profile, isAdmin, isLoading } = useAuth()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [signupOpen, setSignupOpen] = useState(false)

  const username =
    profile?.username ?? (user?.email ? user.email.split('@')[0] : 'user')

  const onLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
    router.push('/')
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-base font-semibold text-gray-900">
              HandheldLab
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-2 sm:flex">
            <Link
              className="rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              href="/games"
            >
              Browse
            </Link>
            <Link
              className="rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              href="/submit"
            >
              Submit
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Mobile hamburger */}
            <button
              className="rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 sm:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Open menu"
            >
              ☰
            </button>

            {/* Auth area */}
            {isLoading ? (
              <div className="h-9 w-28 animate-pulse rounded bg-gray-100" />
            ) : user ? (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs">
                      {username.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="hidden sm:inline">@{username}</span>
                    <span className="text-gray-500">▾</span>
                  </button>
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                  <DropdownMenu.Content className="z-50 min-w-[220px] rounded-md border border-gray-200 bg-white p-1 shadow-lg">
                    <div className="px-3 py-2 text-xs text-gray-500">
                      Signed in as{' '}
                      <span className="text-gray-900">{user.email}</span>
                    </div>
                    <DropdownMenu.Separator className="my-1 h-px bg-gray-200" />

                    <DropdownMenu.Item
                      className="cursor-pointer rounded px-3 py-2 text-sm text-gray-700 outline-none hover:bg-gray-100"
                      onSelect={() => router.push('/profile')}
                    >
                      Profile (placeholder)
                    </DropdownMenu.Item>

                    {isAdmin ? (
                      <DropdownMenu.Item
                        className="cursor-pointer rounded px-3 py-2 text-sm text-gray-700 outline-none hover:bg-gray-100"
                        onSelect={() => router.push('/admin')}
                      >
                        Admin (placeholder)
                      </DropdownMenu.Item>
                    ) : null}

                    <DropdownMenu.Separator className="my-1 h-px bg-gray-200" />

                    <DropdownMenu.Item
                      className="cursor-pointer rounded px-3 py-2 text-sm text-gray-700 outline-none hover:bg-gray-100"
                      onSelect={onLogout}
                    >
                      Log out
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => setLoginOpen(true)}
                  className="hidden sm:inline-flex"
                >
                  Sign in
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setSignupOpen(true)}
                  className="hidden sm:inline-flex"
                >
                  Sign up
                </Button>

                {/* Mobile: single button */}
                <Button
                  variant="primary"
                  onClick={() => setLoginOpen(true)}
                  className="sm:hidden"
                >
                  Sign in
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu panel */}
        {mobileOpen ? (
          <div className="border-t border-gray-200 bg-white sm:hidden">
            <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-3">
              <Link
                className="rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                href="/games"
                onClick={() => setMobileOpen(false)}
              >
                Browse
              </Link>
              <Link
                className="rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                href="/submit"
                onClick={() => setMobileOpen(false)}
              >
                Submit
              </Link>

              {!user ? (
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setMobileOpen(false)
                      setLoginOpen(true)
                    }}
                  >
                    Sign in
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setMobileOpen(false)
                      setSignupOpen(true)
                    }}
                  >
                    Sign up
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </header>

      {/* Modals */}
      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
      <SignupModal open={signupOpen} onOpenChange={setSignupOpen} />
    </>
  )
}
