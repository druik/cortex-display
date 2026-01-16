import crypto from 'crypto'

export const USER_ID = '195145f9-d059-4a71-8722-fa61ecc911f3'

export function isValidApiKey(provided: string | null): boolean {
  const expected = process.env.CORTEX_API_KEY
  if (!provided || !expected) return false

  const a = Buffer.from(provided)
  const b = Buffer.from(expected)

  if (a.length !== b.length) return false

  return crypto.timingSafeEqual(a, b)
}
