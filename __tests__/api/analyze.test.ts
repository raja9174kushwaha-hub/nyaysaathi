/**
 * @jest-environment node
 */
import { POST } from '@/app/api/analyze/route'
import { NextRequest } from 'next/server'
import { rateLimitStore } from '@/lib/rate-limit'

// Mock the Gemini API
jest.mock('@/lib/gemini', () => ({
  callGemini: jest.fn().mockResolvedValue(JSON.stringify({
    summary: 'Test summary',
    overallRiskScore: 45,
    clauses: [
      {
        id: '1.1',
        title: 'Test Clause',
        originalText: 'Original text here',
        plainLanguage: 'Simple explanation',
        riskLevel: 'safe',
        riskTag: 'information',
        recommendation: null,
      },
    ],
  })),
}))

function createRequest(body: object): NextRequest {
  return new NextRequest('http://localhost:3000/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/analyze', () => {
  beforeEach(() => {
    rateLimitStore.clear()
  })

  it('should return 400 for missing text', async () => {
    const req = createRequest({})
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('should return 400 for text too short', async () => {
    const req = createRequest({ text: 'Short' })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('should return 200 with valid analysis for valid text', async () => {
    const req = createRequest({
      text: 'This is a sufficiently long legal document that should pass validation checks.',
    })
    const res = await POST(req)
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data).toHaveProperty('summary')
    expect(data).toHaveProperty('overallRiskScore')
    expect(data).toHaveProperty('clauses')
  })

  it('should return 429 when rate limited', async () => {
    // Exhaust rate limit
    for (let i = 0; i < 16; i++) {
      const req = createRequest({
        text: 'This is a sufficiently long legal document that should pass validation checks.',
      })
      await POST(req)
    }

    const req = createRequest({
      text: 'This is a sufficiently long legal document that should pass validation checks.',
    })
    const res = await POST(req)
    expect(res.status).toBe(429)
  })
})
