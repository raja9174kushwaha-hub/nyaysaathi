import { NextRequest, NextResponse } from 'next/server'
import { callGemini } from '@/lib/gemini'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { analyzeSchema, validateRequestBody, sanitizeText } from '@/lib/validators'

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(req)
    const rateLimit = checkRateLimit(ip)

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'X-RateLimit-Reset': rateLimit.resetTime.toISOString() } }
      )
    }

    // Input validation
    const body = await req.json()
    const { text } = validateRequestBody(analyzeSchema, body)
    const sanitized = sanitizeText(text)

    const prompt = `You are NyaySaathi, an expert Indian legal document analyst. Analyze the following legal document and return a JSON response.

RULES:
- Identify every distinct clause in the document.
- For each clause, provide a plain-language explanation a non-lawyer in India can understand.
- Classify each clause's risk as: "safe", "caution", or "danger".
- Tag each clause as: "right", "obligation", "deadline", "risk", or "information".
- Provide a short recommendation for dangerous/caution clauses.
- Calculate an overall risk score from 0 (completely safe) to 100 (extremely risky).
- Write a 2-3 sentence overall summary.

RESPOND ONLY with valid JSON in this exact format, no markdown, no backticks:
{
  "summary": "2-3 sentence plain-language summary of the whole document",
  "overallRiskScore": 0-100,
  "clauses": [
    {
      "id": "1.1",
      "title": "Short descriptive title",
      "originalText": "Exact text from the document for this clause",
      "plainLanguage": "Plain-language explanation",
      "riskLevel": "safe" | "caution" | "danger",
      "riskTag": "right" | "obligation" | "deadline" | "risk" | "information",
      "recommendation": "What to do about this clause (null if safe)"
    }
  ]
}

DOCUMENT:
${sanitized}`

    const result = await callGemini(prompt)

    // Parse the JSON from the AI response
    let parsed
    try {
      // Strip any markdown code fences the model might add
      const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      parsed = JSON.parse(cleaned)
    } catch {
      return NextResponse.json(
        { error: 'AI returned invalid JSON. Please try again.', raw: result },
        { status: 502 }
      )
    }

    return NextResponse.json(parsed)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to analyze document.'
    console.error('Analyze API error:', message)

    // Return 400 for validation errors, 500 for everything else
    const status = message.includes('too short') || message.includes('required') || message.includes('exceeds') ? 400 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
