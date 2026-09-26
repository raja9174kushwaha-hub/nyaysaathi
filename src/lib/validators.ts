import { z } from 'zod'

export const MAX_TEXT_LENGTH = 500_000
export const MAX_FILE_SIZE = 10 * 1024 * 1024
export const ALLOWED_FILE_EXTENSIONS = ['.pdf', '.txt'] as const
export const ALLOWED_MIME_TYPES = ['application/pdf', 'text/plain'] as const
export const MIN_TEXT_LENGTH = 20

export const analyzeSchema = z.object({
  text: z.string({ required_error: 'Document text is required.' }).min(MIN_TEXT_LENGTH, 'Document text is too short.').max(MAX_TEXT_LENGTH, 'Document text exceeds the maximum length.'),
})

const historySchema = z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().max(5000) })).max(20).default([])
export const chatSchema = z.object({ documentText: z.string().min(MIN_TEXT_LENGTH).max(MAX_TEXT_LENGTH), question: z.string().trim().min(1).max(2000), history: historySchema })
export const compareSchema = z.object({ textA: z.string().min(MIN_TEXT_LENGTH).max(MAX_TEXT_LENGTH), textB: z.string().min(MIN_TEXT_LENGTH).max(MAX_TEXT_LENGTH) })
export const generalChatSchema = z.object({ question: z.string().trim().min(1).max(2000), history: historySchema })

export function sanitizeText(text: string): string {
  return text.replace(/\0/g, '').replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim()
}

export function sanitizeFilename(filename: string): string {
  const basename = filename.split(/[\\/]/).pop() ?? ''
  return basename.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120)
}

export function isAllowedFileExtension(filename: string): boolean {
  const safe = sanitizeFilename(filename).toLowerCase()
  return ALLOWED_FILE_EXTENSIONS.some((ext) => safe.endsWith(ext))
}

export function isAllowedMimeType(mime: string): boolean {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(mime.toLowerCase())
}

export function hasValidFileSignature(bytes: Uint8Array, mime: string): boolean {
  if (mime === 'text/plain') return true
  return mime === 'application/pdf' && bytes.length >= 5 && String.fromCharCode(...bytes.slice(0, 5)) === '%PDF-'
}

export function isFileSizeAllowed(sizeInBytes: number): boolean {
  return Number.isSafeInteger(sizeInBytes) && sizeInBytes > 0 && sizeInBytes <= MAX_FILE_SIZE
}

export function validateRequestBody<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data)
  if (!result.success) throw new Error(result.error.errors[0]?.message || 'Invalid request data.')
  return result.data
}
