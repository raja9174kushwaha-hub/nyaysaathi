import { NextRequest, NextResponse } from 'next/server'
import { callGemini } from '@/lib/gemini'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { generalChatSchema, sanitizeText } from '@/lib/validators'

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req)
    const rateLimit = checkRateLimit(ip)

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'X-RateLimit-Reset': rateLimit.resetTime.toISOString() } }
      )
    }

    const validation = generalChatSchema.safeParse(await req.json())
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || 'Invalid request.' },
        { status: 400 }
      )
    }
    const { question, history } = validation.data

    const sanitizedQuestion = sanitizeText(question)

    const conversationHistory = history
      .map((msg) => `${msg.role === 'user' ? 'User' : 'NyaySaathi'}: ${sanitizeText(msg.content)}`)
      .join('\n')

    const prompt = `You are NyaySaathi, an AI legal assistant for Indian law. You are having a general conversation with a user about legal queries.

RULES:
- Answer in simple, clear language a non-lawyer can understand.
- Provide general legal information, NOT formal legal advice.
- Keep answers concise but thorough (2-4 sentences).
- If the user asks in Hindi or Hinglish, respond in the same language.

${conversationHistory ? `PREVIOUS CONVERSATION:\n${conversationHistory}\n` : ''}
User's question: ${sanitizedQuestion}

RESPOND ONLY with valid JSON, no markdown, no backticks:
{
  "answer": "Your response here"
}`

    const result = await callGemini(prompt)

    let parsed
    try {
      const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      parsed = JSON.parse(cleaned)
    } catch {
      parsed = { answer: result }
    }

    return NextResponse.json(parsed)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to get AI response.'
    console.error('General Chat API error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
