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

    const { text } = await req.json()

    if (!text || text.trim().length < 20) {
      return NextResponse.json(
        { error: 'Document text is too short or missing.' },
        { status: 400 }
      )
    }

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
${text}`

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
  } catch (error: any) {
    console.error('Analyze API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to analyze document.' },
      { status: 500 }
    )
  }
}
