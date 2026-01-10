// components/ui/Select.tsx
'use client'

import * as React from 'react'

type Option = { value: string; label: string }

type Props = {
  label?: string
  value?: string
  onChange: (value: string) => void
  options: Option[]
  placeholder?: string
  error?: string
  name?: string
}

export default function Select({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select...',
  error,
  name,
}: Props) {
  return (
    <div className="space-y-1">
      {label ? (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      ) : null}

      <select
        name={name}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className={[
          'w-full rounded border px-3 py-2 text-sm outline-none',
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
            : 'border-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-200',
        ].join(' ')}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  )
}
