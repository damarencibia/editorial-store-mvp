import type { APIRoute } from 'astro'
import { getServerSupabase } from '../../../lib/auth'
import { serializeCookie } from '../../../lib/utils'

export const GET: APIRoute = async ({ request }) => {
  const headers = new Headers()
  const supabase = getServerSupabase(request, (name, value, options) => {
    headers.append('Set-Cookie', serializeCookie(name, value, options))
  })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401, headers })
  }

  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('*, books!inner(title, slug, cover_url)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers })
  }

  return new Response(JSON.stringify(reviews ?? []), { status: 200, headers })
}
