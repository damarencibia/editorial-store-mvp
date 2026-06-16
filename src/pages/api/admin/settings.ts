import type { APIRoute } from 'astro'
import { getServerSupabase } from '../../../lib/auth'
import { serializeCookie } from '../../../lib/utils'

export const PUT: APIRoute = async ({ request }) => {
  const headers = new Headers()
  const serverSupabase = getServerSupabase(request, (name, value, options) => {
    headers.append('Set-Cookie', serializeCookie(name, value, options))
  })

  const { data: { user } } = await serverSupabase.auth.getUser()
  if (!user) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401, headers })
  }

  const { data: profile } = await serverSupabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 403, headers })
  }

  try {
    const body = await request.json()
    const { show_top_picks, show_trending } = body

    const { error } = await serverSupabase
      .from('site_settings')
      .update({ show_top_picks, show_trending, updated_at: new Date().toISOString() })
      .eq('id', 1)

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400, headers })
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers })
  } catch {
    return new Response(JSON.stringify({ error: 'Error interno' }), { status: 500, headers })
  }
}
