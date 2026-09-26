import { GoogleGenAI } from '@google/genai'

export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

let ai: GoogleGenAI | undefined

export function getGeminiAI(): GoogleGenAI {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set. Please add it to your .env.local file.')
    }
    ai = new GoogleGenAI({ apiKey })
  }
  return ai
}

const MAX_RETRIES = 2
const RETRY_DELAY_MS = 1000
const REQUEST_TIMEOUT_MS = 60000 // 60 seconds

export async function withGeminiRetry<T>(operation: () => Promise<T>): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await operation()
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Don't retry on client errors (4xx) — only on transient/server errors
      const message = lastError.message.toLowerCase()
      if (message.includes('invalid') || message.includes('api key') || message.includes('permission')) {
        throw lastError
      }

      // Wait before retrying (exponential backoff)
      if (attempt < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, attempt)))
      }
    }
  }

  throw lastError || new Error('Gemini API call failed after retries.')
}

/**
 * Call Gemini with automatic retry on transient failures and a timeout.
 */
export async function callGemini(prompt: string): Promise<string> {
  return withGeminiRetry(async () => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const response = await getGeminiAI().models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
      })
      return response.text ?? ''
    } finally {
      clearTimeout(timeout)
    }
  })
}

