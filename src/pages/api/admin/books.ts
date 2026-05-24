import type { APIRoute } from 'astro'
import { supabase } from '../../../lib/supabase'

export const POST: APIRoute = async ({ request }) => {
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

  try {
    const body = await request.json()
    const { title, author, slug, description, price, cover_url } = body

    if (!title || !author || !slug || !price) {
      return new Response(JSON.stringify({ error: 'Faltan campos obligatorios' }), { status: 400 })
    }

    const { data, error } = await supabase.from('books').insert({
      title, author, slug, description, price, cover_url,
    }).select().single()

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 })
    }

    return new Response(JSON.stringify(data), { status: 201 })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Error interno' }), { status: 500 })
  }
}
