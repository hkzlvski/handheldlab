// lib/validations/report.ts
import { z } from 'zod'

export const resolutionEnum = z.enum([
  'native',
  '1080p',
  '900p',
  '800p',
  '720p',
  '540p',
])
export const graphicsPresetEnum = z.enum([
  'low',
  'medium',
  'high',
  'ultra',
  'custom',
])

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_MIME = ['image/png', 'image/jpeg', 'image/webp'] as const
type AllowedMime = (typeof ALLOWED_MIME)[number]

const optionalNumber = z
  .union([z.coerce.number(), z.literal(''), z.undefined(), z.null()])
  .transform((val) =>
    val === '' || val === null || val === undefined ? undefined : val
  )
  .refine((v) => v === undefined || Number.isFinite(v), 'Must be a number')

export const reportBaseSchema = z
  .object({
    game_id: z.string().uuid('Invalid game_id'),
    device_id: z.string().uuid('Invalid device_id'),

    fps_average: z.coerce
      .number()
      .int()
      .min(1, 'FPS average must be >= 1')
      .max(999, 'FPS average must be <= 999'),

    fps_min: optionalNumber
      .refine(
        (v) => v === undefined || (v >= 1 && v <= 999),
        'FPS min must be 1-999'
      )
      .optional(),

    fps_max: optionalNumber
      .refine(
        (v) => v === undefined || (v >= 1 && v <= 999),
        'FPS max must be 1-999'
      )
      .optional(),

    tdp_watts: z.coerce
      .number()
      .int()
      .min(5, 'TDP must be >= 5')
      .max(30, 'TDP must be <= 30'),

    resolution: resolutionEnum,
    graphics_preset: graphicsPresetEnum,

    proton_version: z
      .string()
      .max(50, 'Proton version too long')
      .optional()
      .or(z.literal(''))
      .transform((v) => (v?.trim() ? v.trim() : undefined)),

    additional_notes: z
      .string()
      .max(500, 'Notes must be ≤ 500 characters')
      .optional()
      .or(z.literal(''))
      .transform((v) => (v?.trim() ? v.trim() : undefined)),

    // proof optional
    screenshot: z
      .instanceof(File)
      .refine((f) => f.size <= MAX_FILE_SIZE, 'File must be ≤ 5MB')
      .refine(
        (f) => ALLOWED_MIME.includes(f.type as AllowedMime),
        'Invalid file type'
      )
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.fps_min !== undefined &&
      data.fps_max !== undefined &&
      data.fps_min > data.fps_max
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['fps_min'],
        message: 'FPS min cannot be greater than FPS max',
      })
    }
    if (data.fps_min !== undefined && data.fps_min > data.fps_average) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['fps_min'],
        message: 'FPS min cannot be greater than FPS average',
      })
    }
    if (data.fps_max !== undefined && data.fps_max < data.fps_average) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['fps_max'],
        message: 'FPS max cannot be lower than FPS average',
      })
    }
  })

export type ReportFormData = z.infer<typeof reportBaseSchema>
