import { NextRequest, NextResponse } from 'next/server'
import { callGemini } from '@/lib/gemini'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { generalChatSchema, validateRequestBody, sanitizeText } from '@/lib/validators'
import { chatResultSchema, parseModelJson } from '@/lib/ai-schemas'

export async function POST(req: NextRequest) {
  const rateLimit = checkRateLimit(getClientIp(req))
  if (!rateLimit.success) return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  try {
    const { question, history } = validateRequestBody(generalChatSchema, await req.json())
    const prompt = `You provide general legal information only, NOT legal advice. Answer in simple language. If asked for personalized legal guidance, encourage consulting a lawyer. Keep answers to 2-4 sentences.\n\nPREVIOUS:\n${history.map((m) => `${m.role}: ${sanitizeText(m.content)}`).join('\n')}\n\nQUESTION:\n${sanitizeText(question)}\n\nRespond only JSON: {"answer":"..."}`
    const result = await callGemini(prompt)
    const parsed = parseModelJson(result, chatResultSchema)
    return NextResponse.json(parsed)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to respond.'
    const clientError = /required|short|maximum|invalid request/i.test(message)
    console.error('General Chat API error:', message)
    return NextResponse.json({ error: clientError ? message : 'Unable to respond safely. Please try again.' }, { status: clientError ? 400 : 502 })
  }
}
