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
    const { textA, textB } = await req.json()

    if (!textA || !textB) {
      return NextResponse.json(
        { error: 'Both textA and textB are required.' },
        { status: 400 }
      )
    }

    const prompt = `You are NyaySaathi, an expert Indian legal document comparison analyst. Compare the two versions of a legal document below and identify meaningful differences.

RULES:
- Identify clauses that were added, removed, or modified.
- For each change, explain in plain language what changed and whether the revision is better ("improved"), worse ("worsened"), or neutral ("neutral") for the reader/tenant/employee.
- Provide an overall verdict.

RESPOND ONLY with valid JSON, no markdown, no backticks:
{
  "diffs": [
    {
      "clause": "4.1",
      "title": "Short title of the clause",
      "original": "Exact original text",
      "revised": "Exact revised text",
      "changeType": "modified" | "added" | "removed"
    }
  ],
  "explanations": [
    {
      "clause": "4.1",
      "title": "Short title",
      "verdict": "improved" | "worsened" | "neutral",
      "explanation": "Plain-language explanation of what changed and why it matters"
    }
  ],
  "overallVerdict": "improved" | "worsened" | "neutral",
  "overallSummary": "1-2 sentence overall summary of the changes"
}

DOCUMENT VERSION 1 (Original):
${textA}

DOCUMENT VERSION 2 (Revised):
${textB}`

    const result = await callGemini(prompt)

    let parsed
    try {
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
    console.error('Compare API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to compare documents.' },
      { status: 500 }
    )
  }
}
