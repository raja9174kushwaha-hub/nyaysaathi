import { NextRequest, NextResponse } from 'next/server'
import { getGeminiAI, GEMINI_MODEL, withGeminiRetry } from '@/lib/gemini'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { isAllowedFileExtension, isFileSizeAllowed, MAX_FILE_SIZE, sanitizeFilename, isAllowedMimeType, hasValidFileSignature } from '@/lib/validators'

export async function POST(req: NextRequest) {
  const rateLimit = checkRateLimit(getClientIp(req))
  if (!rateLimit.success) return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
    if (!isAllowedFileExtension(file.name)) return NextResponse.json({ error: 'Unsupported file type. Upload PDF or TXT only.' }, { status: 400 })
    if (!isFileSizeAllowed(file.size)) return NextResponse.json({ error: `File exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit.` }, { status: 400 })
    if (file.type && !isAllowedMimeType(file.type)) return NextResponse.json({ error: 'Invalid file MIME type.' }, { status: 400 })
    const buffer = Buffer.from(await file.arrayBuffer())
    if (!hasValidFileSignature(new Uint8Array(buffer.slice(0, 10)), file.type || 'application/octet-stream')) return NextResponse.json({ error: 'File signature validation failed.' }, { status: 400 })
    let text = ''
    if (file.name.toLowerCase().endsWith('.txt')) {
      text = buffer.toString('utf-8')
    } else if (file.name.toLowerCase().endsWith('.pdf')) {
      const base64 = buffer.toString('base64')
      const response = await withGeminiRetry(() =>
        getGeminiAI().models.generateContent({
          model: GEMINI_MODEL,
          contents: [{ role: 'user', parts: [{ inlineData: { mimeType: 'application/pdf', data: base64 } }, { text: 'Extract all text content from this PDF. Return ONLY raw text preserving structure. Do not add commentary.' }] }],
        })
      )
      text = response.text ?? ''
    }
    if (!text || text.trim().length < 20) return NextResponse.json({ error: 'Could not extract meaningful text from file.' }, { status: 400 })
    return NextResponse.json({ text: text.trim() })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to extract text from file.'
    console.error('Extract API error:', message)
    return NextResponse.json({ error: 'File extraction failed. Please try a different file.' }, { status: 500 })
  }
}
