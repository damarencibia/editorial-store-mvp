import type { APIRoute } from 'astro'
import { getServerSupabase } from '../../../../lib/auth'
import { serializeCookie } from '../../../../lib/utils'
import { attachProfiles } from '../../../../lib/reviews'

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

export const PUT: APIRoute = async ({ params, request }) => {
  const headers = new Headers()
  const supabase = getServerSupabase(request, (name, value, options) => {
    headers.append('Set-Cookie', serializeCookie(name, value, options))
  })

  const authError = await checkAdmin(supabase, headers)
  if (authError) return authError

  const reviewId = Number(params.id)
  if (!reviewId) {
    return new Response(JSON.stringify({ error: 'ID inválido' }), { status: 400, headers })
  }

  const body = await request.json()
  const comment = body.comment !== undefined ? String(body.comment).trim() : undefined

  if (comment !== undefined && comment.length < 1) {
    return new Response(JSON.stringify({ error: 'El comentario no puede estar vacío' }), { status: 400, headers })
  }

  if (comment !== undefined && comment.length > 2000) {
    return new Response(JSON.stringify({ error: 'El comentario no puede exceder 2000 caracteres' }), { status: 400, headers })
  }

  const updates: Record<string, any> = { is_edited: true }
  if (comment !== undefined) updates.comment = comment

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

  const authError = await checkAdmin(supabase, headers)
  if (authError) return authError

  const reviewId = Number(params.id)
  if (!reviewId) {
    return new Response(JSON.stringify({ error: 'ID inválido' }), { status: 400, headers })
  }

  const { error } = await supabase.from('reviews').delete().eq('id', reviewId)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers })
  }

  return new Response(JSON.stringify({ deleted: true }), { status: 200, headers })
}
