import type { APIRoute } from 'astro'
import { getServerSupabase } from '../../../../lib/auth'
import { serializeCookie, slugify } from '../../../../lib/utils'

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
    const name = body.name?.trim()
    if (!name) {
      return new Response(JSON.stringify({ error: 'El nombre es obligatorio' }), { status: 400, headers })
    }

    const slug = body.slug?.trim() || slugify(name)
    const description = body.description?.trim() || null
    const cover_url = body.cover_url?.trim() || null

    const { data, error } = await serverSupabase
      .from('collections')
      .update({ name, slug, description, cover_url })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return new Response(JSON.stringify({ error: 'Ya existe una colección con ese slug' }), { status: 409, headers })
      }
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

  const { count } = await serverSupabase
    .from('categories')
    .select('id', { count: 'exact', head: true })
    .eq('collection_id', id)

  if (count && count > 0) {
    return new Response(
      JSON.stringify({
        error: `No se puede eliminar la colección porque tiene ${count} categoría(s) asociada(s).`,
      }),
      { status: 409, headers },
    )
  }

  const { error } = await serverSupabase.from('collections').delete().eq('id', id)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers })
  }

  return new Response(JSON.stringify({ deleted: true }), { status: 200, headers })
}
