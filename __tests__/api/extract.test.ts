/**
 * @jest-environment node
 */
import { POST } from '@/app/api/extract/route'
import { NextRequest } from 'next/server'
import { rateLimitStore } from '@/lib/rate-limit'
import { getGeminiAI } from '@/lib/gemini'

const mockGenerateContent = jest.fn()

jest.mock('@/lib/gemini', () => ({
  ...jest.requireActual('@/lib/gemini'),
  getGeminiAI: jest.fn(),
}))

describe('POST /api/extract', () => {
  beforeEach(() => {
    rateLimitStore.clear()
    mockGenerateContent.mockReset().mockResolvedValue({
      text: 'Extracted plain text content from sample document.',
    })
    ;(getGeminiAI as jest.Mock).mockReturnValue({
      models: { generateContent: mockGenerateContent },
    })
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

  it('should accept uppercase text file extensions', async () => {
    const textContent = 'This is a sample text contract file with sufficient length.'
    const file = new File([textContent], 'contract.TXT', { type: 'text/plain' })
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

  it('should retry PDF extraction after a temporary Gemini 503', async () => {
    mockGenerateContent
      .mockRejectedValueOnce(new Error('503 UNAVAILABLE: model experiencing high demand'))
      .mockResolvedValueOnce({ text: 'Extracted plain text content from sample PDF.' })

    const file = new File(['%PDF-1.4 sample'], 'contract.pdf', { type: 'application/pdf' })
    const formData = new FormData()
    formData.append('file', file)

    const req = new NextRequest('http://localhost:3000/api/extract', {
      method: 'POST',
      body: formData,
    })
    const res = await POST(req)

    expect(res.status).toBe(200)
    expect(mockGenerateContent).toHaveBeenCalledTimes(2)
  })
})
