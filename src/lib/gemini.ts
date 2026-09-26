import { GoogleGenAI } from '@google/genai'
import { env, requireGeminiKey } from '@/lib/env'

export const GEMINI_MODEL = env.GEMINI_MODEL
let ai: GoogleGenAI | undefined

export function getGeminiAI(): GoogleGenAI {
  if (!ai) ai = new GoogleGenAI({ apiKey: requireGeminiKey() })
  return ai
}

const MAX_RETRIES = 2
const RETRY_DELAY_MS = 1000
const REQUEST_TIMEOUT_MS = 60_000

export async function withGeminiRetry<T>(operation: () => Promise<T>): Promise<T> {
  let lastError: Error | null = null
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      return await operation()
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error('AI provider request failed')
      const message = lastError.message.toLowerCase()
      if (message.includes('invalid') || message.includes('api key') || message.includes('permission')) throw lastError
      if (attempt < MAX_RETRIES) await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * 2 ** attempt))
    }
  }
  throw lastError ?? new Error('AI provider request failed after retries')
}

export async function callGemini(prompt: string): Promise<string> {
  return withGeminiRetry(async () => {
    const timeout = setTimeout(() => undefined, REQUEST_TIMEOUT_MS)
    try {
      const response = await getGeminiAI().models.generateContent({ model: GEMINI_MODEL, contents: prompt })
      return response.text ?? ''
    } finally {
      clearTimeout(timeout)
    }
  })
}
