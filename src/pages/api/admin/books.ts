import type { APIRoute } from 'astro'
import { getServerSupabase } from '../../../lib/auth'
import { serializeCookie } from '../../../lib/utils'

export const POST: APIRoute = async ({ request }) => {
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
    const { title, author, slug, description, price, cover_url } = body

    if (!title || !author || !slug || !price) {
      return new Response(JSON.stringify({ error: 'Faltan campos obligatorios' }), { status: 400, headers })
    }

    const { data, error } = await serverSupabase.from('books').insert({
      title, author, slug, description, price, cover_url,
    }).select().single()

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400, headers })
    }

    return new Response(JSON.stringify(data), { status: 201, headers })
  } catch {
    return new Response(JSON.stringify({ error: 'Error interno' }), { status: 500, headers })
  }
}
