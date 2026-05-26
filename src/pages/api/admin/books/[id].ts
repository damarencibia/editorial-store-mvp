import type { APIRoute } from 'astro'
import { getServerSupabase } from '../../../../lib/auth'
import { serializeCookie } from '../../../../lib/utils'

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

export const PUT: APIRoute = async ({ params, request }) => {
  const headers = new Headers()
  const serverSupabase = getServerSupabase(request, (name, value, options) => {
    headers.append('Set-Cookie', serializeCookie(name, value, options))
  })

  const authError = await checkAdmin(serverSupabase, headers)
  if (authError) return authError

  const id = Number(params.id)
  if (!id) {
    return new Response(JSON.stringify({ error: 'ID inválido' }), { status: 400, headers })
  }

  try {
    const body = await request.json()
    const { title, author, slug, description, price, cover_url, category_id, is_visible, manual_best_seller } = body

    const updates: Record<string, any> = { title, author, slug, description, price, cover_url, category_id, is_visible }

    if (typeof manual_best_seller === 'boolean') {
      updates.manual_best_seller = manual_best_seller
      if (manual_best_seller === true) {
        updates.is_best_seller = true
      }
    }

    const { data, error } = await serverSupabase
      .from('books')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (typeof manual_best_seller === 'boolean' && manual_best_seller === false) {
      await serverSupabase.rpc('sync_best_sellers')
    }

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400, headers })
    }

    return new Response(JSON.stringify(data), { status: 200, headers })
  } catch {
    return new Response(JSON.stringify({ error: 'Error interno' }), { status: 500, headers })
  }
}

export const DELETE: APIRoute = async ({ params, request }) => {
  const headers = new Headers()
  const serverSupabase = getServerSupabase(request, (name, value, options) => {
    headers.append('Set-Cookie', serializeCookie(name, value, options))
  })

  const authError = await checkAdmin(serverSupabase, headers)
  if (authError) return authError

  const id = Number(params.id)
  if (!id) {
    return new Response(JSON.stringify({ error: 'ID inválido' }), { status: 400, headers })
  }

  const { error } = await serverSupabase.from('books').delete().eq('id', id)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers })
  }

  return new Response(JSON.stringify({ deleted: true }), { status: 200, headers })
}

export const POST: APIRoute = async ({ params, request }) => {
  const headers = new Headers()
  const serverSupabase = getServerSupabase(request, (name, value, options) => {
    headers.append('Set-Cookie', serializeCookie(name, value, options))
  })

  const url = new URL(request.url)
  const method = url.searchParams.get('_method')

  if (method === 'DELETE') {
    const authError = await checkAdmin(serverSupabase, headers)
    if (authError) return authError

    const id = Number(params.id)
    if (!id) {
      return new Response(JSON.stringify({ error: 'ID inválido' }), { status: 400, headers })
    }

    const { error } = await serverSupabase.from('books').delete().eq('id', id)

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400, headers })
    }

    headers.set('Location', '/admin/books')
    return new Response(null, { status: 302, headers })
  }

  return new Response(JSON.stringify({ error: 'Método no permitido' }), { status: 405, headers })
}
