// lib/api/error-handler.ts
import { ZodError } from 'zod'

type ErrorResponse =
  | {
      status: 400
      body: {
        requestId: string
        error: 'validation_error'
        details: ReturnType<ZodError['flatten']>
      }
    }
  | {
      status: number
      body: {
        requestId: string
        error: 'bad_request' | 'supabase_error' | 'server_error'
        message: string
      }
    }

type HasMessage = { message?: unknown }

function hasMessage(x: unknown): x is HasMessage {
  return typeof x === 'object' && x !== null && 'message' in x
}

function requestId() {
  return `req_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

export function handleApiError(err: unknown): ErrorResponse {
  const id = requestId()

  // Zod
  if (err instanceof ZodError) {
    return {
      status: 400,
      body: {
        requestId: id,
        error: 'validation_error',
        details: err.flatten(),
      },
    }
  }

  // Known errors from our helpers / route (by error.message)
  if (err instanceof Error) {
    const map: Record<string, { status: number; message: string }> = {
      invalid_file_type: {
        status: 400,
        message: 'Invalid file type (PNG/JPG/WEBP only).',
      },
      file_too_large: { status: 400, message: 'File too large (max 5MB).' },
      unauthorized: { status: 401, message: 'You must be logged in.' },
      invalid_content_type: {
        status: 415,
        message: 'Expected multipart/form-data.',
      },
      invalid_upload_path: { status: 400, message: 'Invalid upload path.' },
      upload_verification_failed: {
        status: 400,
        message: 'Upload verification failed.',
      },
    }

    const hit = map[err.message]
    if (hit) {
      return {
        status: hit.status,
        body: { requestId: id, error: 'bad_request', message: hit.message },
      }
    }

    return {
      status: 500,
      body: { requestId: id, error: 'server_error', message: err.message },
    }
  }

  // Supabase-ish / unknown objects with "message"
  if (hasMessage(err)) {
    const msg = typeof err.message === 'string' ? err.message : 'Unknown error'
    return {
      status: 400,
      body: { requestId: id, error: 'supabase_error', message: msg },
    }
  }

  return {
    status: 500,
    body: { requestId: id, error: 'server_error', message: 'Unknown error' },
  }
}
