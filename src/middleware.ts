import { NextRequest, NextResponse } from 'next/server'

// Security headers applied to all responses
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}

// CORS configuration for API routes
const corsHeaders = {
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
}

function getAllowedOrigins(): string[] {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return [appUrl]
}

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin') ?? ''
  const allowedOrigins = getAllowedOrigins()
  const isAllowedOrigin = allowedOrigins.includes(origin)

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    const preflightHeaders: Record<string, string> = {
      ...corsHeaders,
      ...securityHeaders,
    }
    if (isAllowedOrigin) {
      preflightHeaders['Access-Control-Allow-Origin'] = origin
    }
    return NextResponse.json({}, { headers: preflightHeaders })
  }

  const response = NextResponse.next()

  // Apply security headers to all responses
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Apply CORS headers to API responses
  if (request.nextUrl.pathname.startsWith('/api')) {
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    if (isAllowedOrigin) {
      response.headers.set('Access-Control-Allow-Origin', origin)
    }
  }

  return response
}

export const config = {
  matcher: [
    // Apply security headers to all routes, CORS to /api/*
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
