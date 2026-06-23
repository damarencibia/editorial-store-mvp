import type { APIRoute } from 'astro'
import { getServerSupabase } from '../../../lib/auth'
import { supabaseAdmin } from '../../../lib/supabase-admin'
import { serializeCookie } from '../../../lib/utils'

export const POST: APIRoute = async ({ request, params }) => {
  const headers = new Headers()
  const supabase = getServerSupabase(request, (name, value, options) => {
    headers.append('Set-Cookie', serializeCookie(name, value, options))
  })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401, headers })
  }

  const { fullName } = await request.json()
  if (!fullName || typeof fullName !== 'string') {
    return new Response(JSON.stringify({ error: 'Nombre requerido' }), { status: 400, headers })
  }

  const { data: profile, error: profileFetchError } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  if (profileFetchError || !profile) {
    return new Response(JSON.stringify({ error: 'Perfil no encontrado' }), { status: 404, headers })
  }

  if (profile.full_name !== fullName) {
    return new Response(JSON.stringify({ error: 'El nombre no coincide' }), { status: 403, headers })
  }

  const { error: profileDeleteError } = await supabaseAdmin
    .from('profiles')
    .delete()
    .eq('id', user.id)

  if (profileDeleteError) {
    return new Response(JSON.stringify({ error: profileDeleteError.message }), { status: 500, headers })
  }

  const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)

  if (authDeleteError) {
    return new Response(JSON.stringify({ error: authDeleteError.message }), { status: 500, headers })
  }

  return new Response(JSON.stringify({ deleted: true }), { status: 200, headers })
}
