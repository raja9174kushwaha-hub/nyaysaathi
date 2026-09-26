import { z } from 'zod'

// --- Constants ---
export const MAX_TEXT_LENGTH = 500_000 // ~500KB of text
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const ALLOWED_FILE_EXTENSIONS = ['.pdf', '.txt'] as const
export const ALLOWED_MIME_TYPES = ['application/pdf', 'text/plain'] as const
export const MIN_TEXT_LENGTH = 20

// --- Schemas ---

export const analyzeSchema = z.object({
  text: z
    .string({ required_error: 'Document text is required.' })
    .min(MIN_TEXT_LENGTH, 'Document text is too short (minimum 20 characters).')
    .max(MAX_TEXT_LENGTH, `Document text exceeds maximum length of ${MAX_TEXT_LENGTH} characters.`),
})

export const chatSchema = z.object({
  documentText: z
    .string({ required_error: 'documentText is required.' })
    .min(MIN_TEXT_LENGTH, 'Document text is too short.')
    .max(MAX_TEXT_LENGTH, 'Document text exceeds maximum length.'),
  question: z
    .string({ required_error: 'question is required.' })
    .min(1, 'Question cannot be empty.')
    .max(2000, 'Question is too long (maximum 2000 characters).'),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().max(5000),
      })
    )
    .max(20, 'Too many history messages.')
    .optional()
    .default([]),
})

export const compareSchema = z.object({
  textA: z
    .string({ required_error: 'textA (original document) is required.' })
    .min(MIN_TEXT_LENGTH, 'Original document text is too short.')
    .max(MAX_TEXT_LENGTH, 'Original document text exceeds maximum length.'),
  textB: z
    .string({ required_error: 'textB (revised document) is required.' })
    .min(MIN_TEXT_LENGTH, 'Revised document text is too short.')
    .max(MAX_TEXT_LENGTH, 'Revised document text exceeds maximum length.'),
})

// --- Utility Functions ---

/**
 * Sanitize user-provided text to strip potentially dangerous patterns
 * while preserving the content for AI analysis.
 */
export function sanitizeText(text: string): string {
  return text
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove control characters (except newlines, tabs, carriage returns)
    .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim()
}

/**
 * Validate that a file has an allowed extension.
 */
export function isAllowedFileExtension(filename: string): boolean {
  const lower = filename.toLowerCase()
  return ALLOWED_FILE_EXTENSIONS.some((ext) => lower.endsWith(ext))
}

/**
 * Validate file size is within the allowed limit.
 */
export function isFileSizeAllowed(sizeInBytes: number): boolean {
  return sizeInBytes > 0 && sizeInBytes <= MAX_FILE_SIZE
}

/**
 * Parse and validate a request body against a Zod schema.
 * Returns the validated data or throws a descriptive error.
 */
export function validateRequestBody<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    const firstError = result.error.errors[0]
    throw new Error(firstError?.message || 'Invalid request data.')
  }
  return result.data
}
