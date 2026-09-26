import { NextRequest, NextResponse } from 'next/server'
import { getGeminiAI, GEMINI_MODEL, withGeminiRetry } from '@/lib/gemini'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { isAllowedFileExtension, isFileSizeAllowed, MAX_FILE_SIZE } from '@/lib/validators'

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

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
    }

    // Validate file extension
    if (!isAllowedFileExtension(file.name)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload PDF or TXT.' },
        { status: 400 }
      )
    }

    // Validate file size
    if (!isFileSizeAllowed(file.size)) {
      return NextResponse.json(
        { error: `File size exceeds the ${MAX_FILE_SIZE / 1024 / 1024}MB limit.` },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let text = ''

    if (file.name.toLowerCase().endsWith('.txt')) {
      text = buffer.toString('utf-8')
    } else if (file.name.toLowerCase().endsWith('.pdf')) {
      // Use Gemini to extract text from PDF — it natively understands PDFs
      const base64 = buffer.toString('base64')

      const response = await withGeminiRetry(() =>
        getGeminiAI().models.generateContent({
          model: GEMINI_MODEL,
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
      )

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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to extract text from file.'
    console.error('Extract API error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
