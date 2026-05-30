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

  const authError = await checkAdmin(serverSupabase, headers)
  if (authError) return authError

  const { data: files, error } = await serverSupabase.storage.from('book-covers').list()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers })
  }

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL

  const mapped = (files ?? []).map((f: any) => ({
    name: f.name,
    id: f.id,
    created_at: f.created_at,
    size: f.metadata?.size ?? 0,
    mimetype: f.metadata?.mimetype ?? 'image/jpeg',
    url: `${supabaseUrl}/storage/v1/object/public/book-covers/${f.name}`,
  }))

  return new Response(JSON.stringify(mapped), { status: 200, headers })
}

export const DELETE: APIRoute = async ({ request }) => {
  const headers = new Headers()
  const serverSupabase = getServerSupabase(request, (name, value, options) => {
    headers.append('Set-Cookie', serializeCookie(name, value, options))
  })

  const authError = await checkAdmin(serverSupabase, headers)
  if (authError) return authError

  try {
    const body = await request.json()
    const names = body.names || (body.name ? [body.name] : [])

    if (names.length === 0) {
      return new Response(JSON.stringify({ error: 'Nombres de archivo requeridos' }), { status: 400, headers })
    }

    const { error } = await serverSupabase.storage.from('book-covers').remove(names)

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400, headers })
    }

    return new Response(JSON.stringify({ deleted: true }), { status: 200, headers })
  } catch {
    return new Response(JSON.stringify({ error: 'Error interno' }), { status: 500, headers })
  }
}
