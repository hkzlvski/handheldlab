// components/features/LoginModal.tsx
'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/browser'
import { loginSchema, type LoginFormData } from '@/lib/validations/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function LoginModal({
  open,
  onOpenChange,
  defaultEmail,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  defaultEmail?: string
}) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: defaultEmail ?? '' },
  })

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null)
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      const msg = error.message.toLowerCase()
      if (msg.includes('invalid login credentials'))
        setServerError('Invalid email or password')
      else if (msg.includes('email not confirmed'))
        setServerError('Please verify your email before signing in')
      else setServerError(error.message)
      return
    }

    onOpenChange(false)
    router.refresh()
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg">
          <Dialog.Title className="text-xl font-semibold text-gray-900">
            Sign in
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-gray-600">
            Sign in to your HandheldLab account.
          </Dialog.Description>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
            <Input
              label="Email"
              type="email"
              {...register('email')}
              error={errors.email?.message}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
              error={errors.password?.message}
            />

            {serverError ? (
              <div className="border-error-200 rounded border bg-error-50 p-3 text-sm text-error-700">
                {serverError}
              </div>
            ) : null}

            <div className="flex justify-end gap-3">
              <Dialog.Close asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button type="submit" variant="primary" loading={isSubmitting}>
                Sign in
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
