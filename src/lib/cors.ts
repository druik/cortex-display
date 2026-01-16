import { NextResponse } from 'next/server'

const ALLOWED_ORIGINS = [
  'https://cortex-display.vercel.app',
  'https://prefrontal-swart.vercel.app',
]

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) return true
  return ALLOWED_ORIGINS.includes(origin)
}

export function corsHeaders(origin: string | null): HeadersInit {
  const allowedOrigin = isAllowedOrigin(origin)
    ? (origin || '*')
    : 'null'

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
    'Access-Control-Max-Age': '86400',
  }
}

export function handleCors(request: Request): NextResponse | null {
  const origin = request.headers.get('origin')

  if (!isAllowedOrigin(origin)) {
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
