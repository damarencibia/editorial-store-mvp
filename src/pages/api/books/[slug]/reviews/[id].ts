import type { APIRoute } from 'astro'
import { getServerSupabase } from '../../../../../lib/auth'
import { serializeCookie } from '../../../../../lib/utils'
import { attachProfiles } from '../../../../../lib/reviews'

export const PUT: APIRoute = async ({ params, request }) => {
  const headers = new Headers()
  const supabase = getServerSupabase(request, (name, value, options) => {
    headers.append('Set-Cookie', serializeCookie(name, value, options))
  })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response(JSON.stringify({ error: 'Debes iniciar sesión' }), { status: 401, headers })
  }

  const reviewId = Number(params.id)
  if (!reviewId) {
    return new Response(JSON.stringify({ error: 'ID inválido' }), { status: 400, headers })
  }

  const { data: review } = await supabase
    .from('reviews')
    .select('user_id')
    .eq('id', reviewId)
    .single()

  if (!review) {
    return new Response(JSON.stringify({ error: 'Reseña no encontrada' }), { status: 404, headers })
  }

  if (review.user_id !== user.id) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 403, headers })
  }

  const body = await request.json()
  const rating = body.rating !== undefined ? Number(body.rating) : undefined
  const comment = body.comment !== undefined ? String(body.comment).trim() : undefined

  if (rating !== undefined && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
    return new Response(JSON.stringify({ error: 'La puntuación debe ser entre 1 y 5' }), { status: 400, headers })
  }

  if (comment !== undefined && comment.length < 10) {
    return new Response(JSON.stringify({ error: 'El comentario debe tener al menos 10 caracteres' }), { status: 400, headers })
  }

  if (comment !== undefined && comment.length > 2000) {
    return new Response(JSON.stringify({ error: 'El comentario no puede exceder 2000 caracteres' }), { status: 400, headers })
  }

  const updates: Record<string, any> = {}
  if (rating !== undefined) updates.rating = rating
  if (comment !== undefined) updates.comment = comment
  updates.is_edited = true

  const { data, error } = await supabase
    .from('reviews')
    .update(updates)
    .eq('id', reviewId)
    .select('*')
    .single()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers })
  }

  const enriched = await attachProfiles(supabase, [data])

  return new Response(JSON.stringify(enriched[0]), { status: 200, headers })
}

export const DELETE: APIRoute = async ({ params, request }) => {
  const headers = new Headers()
  const supabase = getServerSupabase(request, (name, value, options) => {
    headers.append('Set-Cookie', serializeCookie(name, value, options))
  })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response(JSON.stringify({ error: 'Debes iniciar sesión' }), { status: 401, headers })
  }

  const reviewId = Number(params.id)
  if (!reviewId) {
    return new Response(JSON.stringify({ error: 'ID inválido' }), { status: 400, headers })
  }

  const { data: review } = await supabase
    .from('reviews')
    .select('user_id')
    .eq('id', reviewId)
    .single()

  if (!review) {
    return new Response(JSON.stringify({ error: 'Reseña no encontrada' }), { status: 404, headers })
  }

  if (review.user_id !== user.id) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 403, headers })
  }

  const { error } = await supabase.from('reviews').delete().eq('id', reviewId)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers })
  }

  return new Response(JSON.stringify({ deleted: true }), { status: 200, headers })
}
