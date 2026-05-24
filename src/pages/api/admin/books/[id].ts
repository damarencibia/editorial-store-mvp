import type { APIRoute } from 'astro'
import { supabase } from '../../../../lib/supabase'

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

export const PUT: APIRoute = async ({ params, request }) => {
  const authError = await checkAdmin()
  if (authError) return authError

  const id = Number(params.id)
  if (!id) {
    return new Response(JSON.stringify({ error: 'ID inválido' }), { status: 400 })
  }

  try {
    const body = await request.json()
    const { title, author, slug, description, price, cover_url } = body

    const { data, error } = await supabase
      .from('books')
      .update({ title, author, slug, description, price, cover_url })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 })
    }

    return new Response(JSON.stringify(data), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Error interno' }), { status: 500 })
  }
}

export const DELETE: APIRoute = async ({ params }) => {
  const authError = await checkAdmin()
  if (authError) return authError

  const id = Number(params.id)
  if (!id) {
    return new Response(JSON.stringify({ error: 'ID inválido' }), { status: 400 })
  }

  const { error } = await supabase.from('books').delete().eq('id', id)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }

  return new Response(JSON.stringify({ deleted: true }), { status: 200 })
}

export const POST: APIRoute = async ({ params, request }) => {
  const url = new URL(request.url)
  const method = url.searchParams.get('_method')

  if (method === 'DELETE') {
    const authError = await checkAdmin()
    if (authError) return authError

    const id = Number(params.id)
    if (!id) {
      return new Response(JSON.stringify({ error: 'ID inválido' }), { status: 400 })
    }

    const { error } = await supabase.from('books').delete().eq('id', id)

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 })
    }

    return new Response(null, {
      status: 302,
      headers: { Location: '/admin/books' },
    })
  }

  return new Response(JSON.stringify({ error: 'Método no permitido' }), { status: 405 })
}
