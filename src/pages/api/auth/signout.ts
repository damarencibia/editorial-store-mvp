import type { APIRoute } from 'astro'
import { getServerSupabase } from '../../../lib/auth'

export const POST: APIRoute = async ({ request }) => {
  const headers = new Headers()

  const serverSupabase = getServerSupabase(request, (name, value, options) => {
    headers.append('Set-Cookie', serializeCookie(name, value, options))
  })

  const { error } = await serverSupabase.auth.signOut()
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  headers.set('Location', '/')
  return new Response(null, { status: 302, headers })
}

function serializeCookie(
  name: string,
  value: string,
  options: Record<string, unknown>,
): string {
  let cookie = `${name}=${value}`
  if (options.path) cookie += `; Path=${options.path}`
  if (typeof options.maxAge === 'number') cookie += `; Max-Age=${options.maxAge}`
  if (options.httpOnly) cookie += '; HttpOnly'
  if (options.sameSite) cookie += `; SameSite=${options.sameSite}`
  if (options.secure) cookie += '; Secure'
  return cookie
}
