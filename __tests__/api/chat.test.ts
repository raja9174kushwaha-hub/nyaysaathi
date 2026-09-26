/**
 * @jest-environment node
 */
import { POST } from '@/app/api/chat/route'
import { NextRequest } from 'next/server'
import { rateLimitStore } from '@/lib/rate-limit'

// Mock the Gemini API
jest.mock('@/lib/gemini', () => ({
  callGemini: jest.fn().mockResolvedValue(JSON.stringify({
    answer: 'Based on clause 3.1, you can terminate the lease with 30 days notice.',
    citation: 'Clause 3.1 — Termination',
  })),
}))

function createRequest(body: object): NextRequest {
  return new NextRequest('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/chat', () => {
  beforeEach(() => {
    rateLimitStore.clear()
  })

  it('should return 400 when documentText is missing', async () => {
    const req = createRequest({ question: 'What is clause 1?' })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('should return 400 when question is missing', async () => {
    const req = createRequest({
      documentText: 'A valid document with at least twenty characters for analysis.',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('should return 200 with answer for valid input', async () => {
    const req = createRequest({
      documentText: 'A valid document with at least twenty characters for analysis.',
      question: 'What does clause 3 mean?',
    })
    const res = await POST(req)
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data).toHaveProperty('answer')
    expect(data).toHaveProperty('citation')
  })

  it('should accept conversation history', async () => {
    const req = createRequest({
      documentText: 'A valid document with at least twenty characters for analysis.',
      question: 'Can you explain further?',
      history: [
        { role: 'user', content: 'What is clause 1?' },
        { role: 'assistant', content: 'Clause 1 is about...' },
      ],
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
  })

  it('should return 429 when rate limited', async () => {
    for (let i = 0; i < 16; i++) {
      const req = createRequest({
        documentText: 'A valid document with at least twenty characters for analysis.',
        question: 'Test question?',
      })
      await POST(req)
    }

    const req = createRequest({
      documentText: 'A valid document with at least twenty characters for analysis.',
      question: 'Test question?',
    })
    const res = await POST(req)
    expect(res.status).toBe(429)
  })
})
