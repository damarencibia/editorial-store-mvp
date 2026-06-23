import type { APIRoute } from 'astro'
import { getServerSupabase } from '../../../../lib/auth'
import { supabaseAdmin } from '../../../../lib/supabase-admin'
import { serializeCookie } from '../../../../lib/utils'

async function checkAdmin(
  supabase: ReturnType<typeof getServerSupabase>,
  headers: Headers,
): Promise<Response | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401, headers })
  }

  const { data: profile } = await supabase
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
  const supabase = getServerSupabase(request, (name, value, options) => {
    headers.append('Set-Cookie', serializeCookie(name, value, options))
  })

  const authError = await checkAdmin(supabase, headers)
  if (authError) return authError

  const userId = params.id
  if (!userId) {
    return new Response(JSON.stringify({ error: 'ID inválido' }), { status: 400, headers })
  }

  const body = await request.json()
  const { action } = body

  if (action === 'freeze') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('frozen')
      .eq('id', userId)
      .single()

    if (!profile) {
      return new Response(JSON.stringify({ error: 'Cliente no encontrado' }), { status: 404, headers })
    }

    const { error } = await supabase
      .from('profiles')
      .update({ frozen: !profile.frozen })
      .eq('id', userId)

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400, headers })
    }

    return new Response(JSON.stringify({ frozen: !profile.frozen }), { status: 200, headers })
  }

  if (action === 'role') {
    const { value } = body
    if (!value || !['customer', 'admin'].includes(value)) {
      return new Response(JSON.stringify({ error: 'Rol inválido' }), { status: 400, headers })
    }

    const { error } = await supabase
      .from('profiles')
      .update({ role: value })
      .eq('id', userId)

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400, headers })
    }

    return new Response(JSON.stringify({ role: value }), { status: 200, headers })
  }

  return new Response(JSON.stringify({ error: 'Acción no válida' }), { status: 400, headers })
}

export const DELETE: APIRoute = async ({ params, request }) => {
  const headers = new Headers()
  const supabase = getServerSupabase(request, (name, value, options) => {
    headers.append('Set-Cookie', serializeCookie(name, value, options))
  })

  const authError = await checkAdmin(supabase, headers)
  if (authError) return authError

  const userId = params.id
  if (!userId) {
    return new Response(JSON.stringify({ error: 'ID inválido' }), { status: 400, headers })
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId)

  if (profileError) {
    return new Response(JSON.stringify({ error: profileError.message }), { status: 400, headers })
  }

  const { error: authError2 } = await supabaseAdmin.auth.admin.deleteUser(userId)

  if (authError2) {
    return new Response(JSON.stringify({ error: authError2.message }), { status: 400, headers })
  }

  return new Response(JSON.stringify({ deleted: true }), { status: 200, headers })
}
