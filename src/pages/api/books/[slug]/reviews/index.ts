import type { APIRoute } from 'astro'
import { getServerSupabase } from '../../../../../lib/auth'
import { supabaseAdmin } from '../../../../../lib/supabase-admin'
import { serializeCookie } from '../../../../../lib/utils'
import { attachProfiles } from '../../../../../lib/reviews'

export const GET: APIRoute = async ({ params }) => {
  const { slug } = params

  const { data: book } = await supabaseAdmin
    .from('books')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!book) {
    return new Response(JSON.stringify({ error: 'Libro no encontrado' }), { status: 404 })
  }

  const { data: reviews, error } = await supabaseAdmin
    .from('reviews')
    .select('*')
    .eq('book_id', book.id)
    .order('created_at', { ascending: false })

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  const enriched = await attachProfiles(supabaseAdmin, reviews)

  const avg = enriched && enriched.length > 0
    ? enriched.reduce((s: number, r: any) => s + r.rating, 0) / enriched.length
    : 0

  return new Response(JSON.stringify({
    reviews: enriched ?? [],
    total: enriched?.length ?? 0,
    avg_rating: Math.round(avg * 10) / 10,
  }), { status: 200 })
}

export const POST: APIRoute = async ({ params, request }) => {
  const headers = new Headers()
  const supabase = getServerSupabase(request, (name, value, options) => {
    headers.append('Set-Cookie', serializeCookie(name, value, options))
  })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response(JSON.stringify({ error: 'Debes iniciar sesión' }), { status: 401, headers })
  }

  const { slug } = params
  const { data: book } = await supabase
    .from('books')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!book) {
    return new Response(JSON.stringify({ error: 'Libro no encontrado' }), { status: 404, headers })
  }

  const body = await request.json()
  const rating = Number(body.rating)
  const comment = String(body.comment ?? '').trim()

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return new Response(JSON.stringify({ error: 'La puntuación debe ser entre 1 y 5' }), { status: 400, headers })
  }

  if (!comment || comment.length < 10) {
    return new Response(JSON.stringify({ error: 'El comentario debe tener al menos 10 caracteres' }), { status: 400, headers })
  }

  if (comment.length > 2000) {
    return new Response(JSON.stringify({ error: 'El comentario no puede exceder 2000 caracteres' }), { status: 400, headers })
  }

  const { data: existing } = await supabase
    .from('reviews')
    .select('id')
    .eq('book_id', book.id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    return new Response(JSON.stringify({ error: 'Ya has reseñado este libro' }), { status: 409, headers })
  }

  const { data, error } = await supabase
    .from('reviews')
    .insert({ book_id: book.id, user_id: user.id, rating, comment })
    .select('*')
    .single()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers })
  }

  const enriched = await attachProfiles(supabaseAdmin, [data])

  return new Response(JSON.stringify(enriched[0]), { status: 201, headers })
}
