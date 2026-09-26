/**
 * @jest-environment node
 */
import { POST } from '@/app/api/extract/route'
import { NextRequest } from 'next/server'
import { rateLimitStore } from '@/lib/rate-limit'

// Mock pdf-parse or ai module
jest.mock('@/lib/gemini', () => ({
  ai: {
    models: {
      generateContent: jest.fn().mockResolvedValue({
        text: 'Extracted plain text content from sample document.',
      }),
    },
  },
}))

describe('POST /api/extract', () => {
  beforeEach(() => {
    rateLimitStore.clear()
  })

  it('should return 400 when no file is uploaded', async () => {
    const formData = new FormData()
    const req = new NextRequest('http://localhost:3000/api/extract', {
      method: 'POST',
      body: formData,
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toMatch(/no file provided/i)
  })

  it('should return 400 for unsupported file extension', async () => {
    const file = new File(['hello'], 'document.png', { type: 'image/png' })
    const formData = new FormData()
    formData.append('file', file)

    const req = new NextRequest('http://localhost:3000/api/extract', {
      method: 'POST',
      body: formData,
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toMatch(/unsupported file type/i)
  })

  it('should return 200 and extracted text for plain text file', async () => {
    const textContent = 'This is a sample text contract file with sufficient length.'
    const file = new File([textContent], 'contract.txt', { type: 'text/plain' })
    const formData = new FormData()
    formData.append('file', file)

    const req = new NextRequest('http://localhost:3000/api/extract', {
      method: 'POST',
      body: formData,
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.text).toBe(textContent)
  })
})
