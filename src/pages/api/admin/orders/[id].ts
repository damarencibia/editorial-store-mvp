import type { APIRoute } from 'astro'
import { supabase } from '../../../../lib/supabase'

const VALID_STATUSES = ['pending', 'paid', 'shipped', 'cancelled']

async function checkAdmin(): Promise<Response | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 })
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 403 })
  }
  return null
}

export const PATCH: APIRoute = async ({ params, request }) => {
  const authError = await checkAdmin()
  if (authError) return authError

  const id = Number(params.id)
  if (!id) {
    return new Response(JSON.stringify({ error: 'ID inválido' }), { status: 400 })
  }

  try {
    const { status } = await request.json()

    if (!VALID_STATUSES.includes(status)) {
      return new Response(JSON.stringify({ error: 'Estado inválido' }), { status: 400 })
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 })
    }

    return new Response(JSON.stringify(data), { status: 200 })
  } catch {
    return new Response(JSON.stringify({ error: 'Error interno' }), { status: 500 })
  }
}
