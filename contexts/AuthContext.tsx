// contexts/AuthContext.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/browser'
import type { User } from '@supabase/supabase-js'

type Profile = {
  id: string
  username: string
}

type AuthContextType = {
  user: User | null
  profile: Profile | null
  isAdmin: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isAdmin: false,
  isLoading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function hydrate(sessionUser: User | null) {
      setUser(sessionUser)

      if (!sessionUser) {
        setProfile(null)
        setIsAdmin(false)
        setIsLoading(false)
        return
      }

      const [{ data: profileData }, { data: adminStatus }] = await Promise.all([
        supabase
          .from('public_profiles')
          .select('id, username')
          .eq('id', sessionUser.id)
          .single(),
        supabase.rpc('is_user_admin'),
      ])

      setProfile(profileData ?? null)
      setIsAdmin(Boolean(adminStatus))
      setIsLoading(false)
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      hydrate(session?.user ?? null)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      hydrate(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, profile, isAdmin, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
