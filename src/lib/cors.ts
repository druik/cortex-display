import { NextResponse } from 'next/server'

const ALLOWED_ORIGINS = [
  'https://cortex-display.vercel.app',
  'https://prefrontal-swart.vercel.app',
]

function isAllowedOrigin(origin: string | null, referer: string | null): boolean {
  if (!origin) return true

  if (origin.includes('localhost') || origin.includes('127.0.0.1')) return true

  if (ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed))) return true

  if (referer) {
    const refererOrigin = new URL(referer).origin
    if (refererOrigin === origin) return true
    if (ALLOWED_ORIGINS.some(allowed => refererOrigin.startsWith(allowed))) return true
  }

  return false
}

export function corsHeaders(origin: string | null): HeadersInit {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
    'Access-Control-Max-Age': '86400',
  }
}

export function handleCors(request: Request): NextResponse | null {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')

  if (!isAllowedOrigin(origin, referer)) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403, headers: corsHeaders(origin) }
    )
  }

  return null
}

export function optionsResponse(request: Request): NextResponse {
  const origin = request.headers.get('origin')
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(origin),
  })
}
