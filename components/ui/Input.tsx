// components/ui/Input.tsx
import * as React from 'react'
import { cn } from '@/components/utils/cn'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string | null
}

export function Input({ id, label, error, className, ...props }: InputProps) {
  const inputId = id ?? props.name ?? undefined
  const describedBy = error && inputId ? `${inputId}-error` : undefined

  return (
    <div>
      {label ? (
        <label
          htmlFor={inputId}
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      ) : null}

      <input
        id={inputId}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy}
        className={cn(
          'w-full rounded border px-3 py-2 placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500',
          error
            ? 'border-2 border-error-500 focus:border-error-500 focus:ring-error-500'
            : 'border-gray-300',
          className
        )}
        {...props}
      />

      {error && inputId ? (
        <p id={`${inputId}-error`} className="mt-1 text-sm text-error-600">
          {error}
        </p>
      ) : null}
    </div>
  )
}
