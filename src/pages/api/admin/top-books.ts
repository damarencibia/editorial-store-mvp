import type { APIRoute } from 'astro'
import { getServerSupabase } from '../../../lib/auth'
import { serializeCookie } from '../../../lib/utils'

async function checkAdmin(
  serverSupabase: ReturnType<typeof getServerSupabase>,
  headers: Headers,
): Promise<Response | null> {
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

  return null
}

export const GET: APIRoute = async ({ request }) => {
  const headers = new Headers()
  const serverSupabase = getServerSupabase(request, (name, value, options) => {
    headers.append('Set-Cookie', serializeCookie(name, value, options))
  })

  const { data, error } = await serverSupabase
    .from('monthly_picks')
    .select('*, books(*)')
    .order('position')

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers })
  }

  return new Response(JSON.stringify(data), { status: 200, headers })
}

export const POST: APIRoute = async ({ request }) => {
  const headers = new Headers()
  const serverSupabase = getServerSupabase(request, (name, value, options) => {
    headers.append('Set-Cookie', serializeCookie(name, value, options))
  })

  const authError = await checkAdmin(serverSupabase, headers)
  if (authError) return authError

  try {
    const body = await request.json()
    const book_id = Number(body.book_id)
    if (!book_id) {
      return new Response(JSON.stringify({ error: 'ID de libro inválido' }), { status: 400, headers })
    }

    const { data: existing } = await serverSupabase
      .from('monthly_picks')
      .select('id')
      .eq('book_id', book_id)
      .maybeSingle()

    if (existing) {
      return new Response(JSON.stringify({ error: 'Este libro ya está en el Top 10' }), { status: 409, headers })
    }

    const { count } = await serverSupabase
      .from('monthly_picks')
      .select('id', { count: 'exact', head: true })

    if (count && count >= 10) {
      return new Response(JSON.stringify({ error: 'Ya hay 10 libros en el Top 10. Quita uno antes de agregar otro.' }), { status: 409, headers })
    }

    const position = (count ?? 0) + 1

    const { data, error } = await serverSupabase
      .from('monthly_picks')
      .insert({ book_id, position })
      .select('*, books(*)')
      .single()

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400, headers })
    }

    return new Response(JSON.stringify(data), { status: 201, headers })
  } catch {
    return new Response(JSON.stringify({ error: 'Error interno' }), { status: 500, headers })
  }
}

export const PUT: APIRoute = async ({ request }) => {
  const headers = new Headers()
  const serverSupabase = getServerSupabase(request, (name, value, options) => {
    headers.append('Set-Cookie', serializeCookie(name, value, options))
  })

  const authError = await checkAdmin(serverSupabase, headers)
  if (authError) return authError

  try {
    const body = await request.json()

    if (!body.pick_ids || !Array.isArray(body.pick_ids)) {
      return new Response(JSON.stringify({ error: 'Se requiere un array pick_ids' }), { status: 400, headers })
    }

    for (let i = 0; i < body.pick_ids.length; i++) {
      const { error } = await serverSupabase
        .from('monthly_picks')
        .update({ position: i + 1 })
        .eq('id', body.pick_ids[i])

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400, headers })
      }
    }

    return new Response(JSON.stringify({ reordered: true }), { status: 200, headers })
  } catch {
    return new Response(JSON.stringify({ error: 'Error interno' }), { status: 500, headers })
  }
}
