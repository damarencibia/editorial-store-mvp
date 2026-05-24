import type { APIRoute } from 'astro'
import { getServerSupabase } from '../../../lib/auth'
import { serializeCookie } from '../../../lib/utils'

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
