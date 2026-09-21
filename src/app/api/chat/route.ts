import { NextRequest, NextResponse } from 'next/server'
import { callGemini } from '@/lib/gemini'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

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
    const { documentText, question, history } = await req.json()

    if (!documentText || !question) {
      return NextResponse.json(
        { error: 'documentText and question are required.' },
        { status: 400 }
      )
    }

    // Build conversation context
    const conversationHistory = (history || [])
      .map((msg: { role: string; content: string }) => `${msg.role === 'user' ? 'User' : 'NyaySaathi'}: ${msg.content}`)
      .join('\n')

    const prompt = `You are NyaySaathi, an AI legal assistant for Indian law. You are having a conversation about a legal document. Answer the user's question ONLY using information from the document below. If the answer is not in the document, say so clearly.

RULES:
- Answer in simple, clear language a non-lawyer can understand.
- If relevant, cite the specific clause (e.g., "Clause 4.1").
- Keep answers concise but thorough (2-4 sentences).
- If the user asks in Hindi or Hinglish, respond in the same language.
- Never make up information not in the document.

DOCUMENT:
${documentText}

${conversationHistory ? `PREVIOUS CONVERSATION:\n${conversationHistory}\n` : ''}
User's question: ${question}

RESPOND ONLY with valid JSON, no markdown, no backticks:
{
  "answer": "Your response here",
  "citation": "Clause X.X — Title (or null if no specific clause cited)"
}`

    const result = await callGemini(prompt)

    let parsed
    try {
      const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      parsed = JSON.parse(cleaned)
    } catch {
      // If JSON parsing fails, return the raw text as the answer
      parsed = { answer: result, citation: null }
    }

    return NextResponse.json(parsed)
  } catch (error: any) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get AI response.' },
      { status: 500 }
    )
  }
}
