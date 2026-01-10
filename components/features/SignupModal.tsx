// components/features/SignupModal.tsx
'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/browser'
import { signupSchema, type SignupFormData } from '@/lib/validations/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function SignupModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [successEmail, setSuccessEmail] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupFormData) => {
    setServerError(null)
    setSuccessEmail(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { username: data.username },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      if (error.message.toLowerCase().includes('already registered')) {
        setServerError('Email already registered')
      } else {
        setServerError(error.message)
      }
      return
    }

    setSuccessEmail(data.email)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg">
          <Dialog.Title className="text-xl font-semibold text-gray-900">
            Create account
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-gray-600">
            Join HandheldLab to share and discover performance reports.
          </Dialog.Description>

          {successEmail ? (
            <div className="border-success-200 text-success-800 mt-5 rounded border bg-success-50 p-4 text-sm">
              Check your email:{' '}
              <span className="font-medium">{successEmail}</span>. Click the
              verification link to activate your account.
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
              <Input
                label="Email"
                type="email"
                {...register('email')}
                error={errors.email?.message}
              />
              <Input
                label="Username"
                type="text"
                autoComplete="username"
                {...register('username')}
                error={errors.username?.message}
              />
              <Input
                label="Password"
                type="password"
                autoComplete="new-password"
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
                  Sign up
                </Button>
              </div>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
