/**
 * @jest-environment node
 */
import { POST } from '@/app/api/compare/route'
import { NextRequest } from 'next/server'
import { rateLimitStore } from '@/lib/rate-limit'

// Mock the Gemini API
jest.mock('@/lib/gemini', () => ({
  callGemini: jest.fn().mockResolvedValue(JSON.stringify({
    diffs: [
      {
        clause: '2.1',
        title: 'Rent Amount',
        original: 'Rent is ₹20,000',
        revised: 'Rent is ₹25,000',
        changeType: 'modified',
      },
    ],
    explanations: [
      {
        clause: '2.1',
        title: 'Rent Amount',
        verdict: 'worsened',
        explanation: 'The rent increased by ₹5,000 which is unfavorable for the tenant.',
      },
    ],
    overallVerdict: 'worsened',
    overallSummary: 'The revised lease increases rent and adds penalties.',
  })),
}))

function createRequest(body: object): NextRequest {
  return new NextRequest('http://localhost:3000/api/compare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/compare', () => {
  beforeEach(() => {
    rateLimitStore.clear()
  })

  it('should return 400 when textA is missing', async () => {
    const req = createRequest({
      textB: 'Revised document text that is long enough for validation.',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('should return 400 when textB is missing', async () => {
    const req = createRequest({
      textA: 'Original document text that is long enough for validation.',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('should return 200 with comparison result for valid input', async () => {
    const req = createRequest({
      textA: 'Original document text that is long enough for validation.',
      textB: 'Revised document text that is also long enough for the check.',
    })
    const res = await POST(req)
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data).toHaveProperty('diffs')
    expect(data).toHaveProperty('explanations')
    expect(data).toHaveProperty('overallVerdict')
    expect(data).toHaveProperty('overallSummary')
    expect(Array.isArray(data.diffs)).toBe(true)
  })

  it('should return 429 when rate limited', async () => {
    for (let i = 0; i < 16; i++) {
      const req = createRequest({
        textA: 'Original document text that is long enough for validation.',
        textB: 'Revised document text that is also long enough for the check.',
      })
      await POST(req)
    }

    const req = createRequest({
      textA: 'Original document text that is long enough for validation.',
      textB: 'Revised document text that is also long enough for the check.',
    })
    const res = await POST(req)
    expect(res.status).toBe(429)
  })
})
