import { checkRateLimit, getClientIp, rateLimitStore, MAX_REQUESTS_PER_WINDOW } from '@/lib/rate-limit'

function createMockRequest(headersObj: Record<string, string> = {}): Request {
  const map = new Map<string, string>(
    Object.entries(headersObj).map(([k, v]) => [k.toLowerCase(), v])
  )
  return {
    headers: {
      get: (name: string) => map.get(name.toLowerCase()) || null,
    },
  } as unknown as Request
}

describe('Rate Limiter', () => {
  beforeEach(() => {
    rateLimitStore.clear()
  })

  describe('checkRateLimit', () => {
    it('should allow first request from a new IP', () => {
      const result = checkRateLimit('192.168.1.1')
      expect(result.success).toBe(true)
      expect(result.remaining).toBe(MAX_REQUESTS_PER_WINDOW - 1)
    })

    it('should decrement remaining count on successive requests', () => {
      checkRateLimit('192.168.1.2')
      const result = checkRateLimit('192.168.1.2')
      expect(result.success).toBe(true)
      expect(result.remaining).toBe(MAX_REQUESTS_PER_WINDOW - 2)
    })

    it('should block requests when limit is exceeded', () => {
      const ip = '10.0.0.1'
      for (let i = 0; i < MAX_REQUESTS_PER_WINDOW; i++) {
        checkRateLimit(ip)
      }
      const result = checkRateLimit(ip)
      expect(result.success).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('should track different IPs independently', () => {
      // Exhaust limit for IP A
      for (let i = 0; i < MAX_REQUESTS_PER_WINDOW; i++) {
        checkRateLimit('ip-a')
      }
      // IP B should still be allowed
      const result = checkRateLimit('ip-b')
      expect(result.success).toBe(true)
    })

    it('should include a resetTime in the future', () => {
      const result = checkRateLimit('192.168.1.3')
      expect(result.resetTime.getTime()).toBeGreaterThan(Date.now())
    })

    it('should include the correct limit value', () => {
      const result = checkRateLimit('192.168.1.4')
      expect(result.limit).toBe(MAX_REQUESTS_PER_WINDOW)
    })
  })

  describe('getClientIp', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const req = createMockRequest({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' })
      expect(getClientIp(req)).toBe('1.2.3.4')
    })

    it('should extract IP from x-real-ip header', () => {
      const req = createMockRequest({ 'x-real-ip': '9.9.9.9' })
      expect(getClientIp(req)).toBe('9.9.9.9')
    })

    it('should prefer x-forwarded-for over x-real-ip', () => {
      const req = createMockRequest({
        'x-forwarded-for': '1.1.1.1',
        'x-real-ip': '2.2.2.2',
      })
      expect(getClientIp(req)).toBe('1.1.1.1')
    })

    it('should fallback to 127.0.0.1 when no headers present', () => {
      const req = createMockRequest({})
      expect(getClientIp(req)).toBe('127.0.0.1')
    })
  })
})
