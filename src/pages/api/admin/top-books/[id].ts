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

  const { data: pick } = await serverSupabase
    .from('monthly_picks')
    .select('position')
    .eq('id', id)
    .single()

  if (!pick) {
    return new Response(JSON.stringify({ error: 'No encontrado' }), { status: 404, headers })
  }

  const removedPosition = pick.position

  const { error: deleteError } = await serverSupabase
    .from('monthly_picks')
    .delete()
    .eq('id', id)

  if (deleteError) {
    return new Response(JSON.stringify({ error: deleteError.message }), { status: 400, headers })
  }

  // Decrement positions of picks that were after the removed one
  const { data: after } = await serverSupabase
    .from('monthly_picks')
    .select('id, position')
    .gt('position', removedPosition)
    .order('position')

  if (after) {
    for (const p of after) {
      await serverSupabase
        .from('monthly_picks')
        .update({ position: p.position - 1 })
        .eq('id', p.id)
    }
  }

  return new Response(JSON.stringify({ deleted: true }), { status: 200, headers })
}
