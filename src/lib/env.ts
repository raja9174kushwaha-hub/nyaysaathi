import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  GEMINI_MODEL: z.string().min(1).default('gemini-2.5-flash'),
  GEMINI_API_KEY: z.string().min(10).optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional().or(z.literal('')),
})

export const env = envSchema.parse(process.env)

export function requireGeminiKey(): string {
  const apiKey = env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY. Add it to your .env.local file before using AI features.')
  }
  return apiKey
}
