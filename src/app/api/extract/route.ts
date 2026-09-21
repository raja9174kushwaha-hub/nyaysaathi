import { NextRequest, NextResponse } from 'next/server'
import { ai } from '@/lib/gemini'
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
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let text = ''

    if (file.name.endsWith('.txt')) {
      text = buffer.toString('utf-8')
    } else if (file.name.endsWith('.pdf')) {
      // Use Gemini to extract text from PDF — it natively understands PDFs
      const base64 = buffer.toString('base64')

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: 'application/pdf',
                  data: base64,
                },
              },
              {
                text: 'Extract ALL the text content from this PDF document. Return ONLY the raw text, preserving the original structure (headings, paragraphs, clauses, numbered lists). Do not add any commentary, analysis, or formatting — just the exact text from the document.',
              },
            ],
          },
        ],
      })

      text = response.text ?? ''
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload PDF or TXT.' },
        { status: 400 }
      )
    }

    if (!text || text.trim().length < 20) {
      return NextResponse.json(
        { error: 'Could not extract meaningful text from the file.' },
        { status: 400 }
      )
    }

    return NextResponse.json({ text: text.trim() })
  } catch (error: any) {
    console.error('Extract API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to extract text from file.' },
      { status: 500 }
    )
  }
}
