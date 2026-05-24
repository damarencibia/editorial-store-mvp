import type { APIRoute } from 'astro'
import { getServerSupabase } from '../../../../lib/auth'
import { serializeCookie } from '../../../../lib/utils'

const VALID_STATUSES = ['pending', 'paid', 'shipped', 'cancelled']

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

export const PATCH: APIRoute = async ({ params, request }) => {
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
    const { status } = await request.json()

    if (!VALID_STATUSES.includes(status)) {
      return new Response(JSON.stringify({ error: 'Estado inválido' }), { status: 400, headers })
    }

    const { data, error } = await serverSupabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400, headers })
    }

    return new Response(JSON.stringify(data), { status: 200, headers })
  } catch {
    return new Response(JSON.stringify({ error: 'Error interno' }), { status: 500, headers })
  }
}
