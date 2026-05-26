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

export const POST: APIRoute = async ({ request }) => {
  const headers = new Headers()
  const serverSupabase = getServerSupabase(request, (name, value, options) => {
    headers.append('Set-Cookie', serializeCookie(name, value, options))
  })

  const authError = await checkAdmin(serverSupabase, headers)
  if (authError) return authError

  try {
    const body = await request.json()
    const { action, ids } = body

    if (!action || !Array.isArray(ids) || ids.length === 0) {
      return new Response(JSON.stringify({ error: 'Faltan campos obligatorios' }), { status: 400, headers })
    }

    switch (action) {
      case 'toggle_visibility': {
        const { data: books } = await serverSupabase
          .from('books')
          .select('id, is_visible')
          .in('id', ids)

        if (!books) {
          return new Response(JSON.stringify({ error: 'Libros no encontrados' }), { status: 404, headers })
        }

        for (const book of books) {
          await serverSupabase
            .from('books')
            .update({ is_visible: !book.is_visible })
            .eq('id', book.id)
        }

        return new Response(JSON.stringify({ success: true }), { status: 200, headers })
      }

      case 'toggle_best_seller': {
        const { data: books } = await serverSupabase
          .from('books')
          .select('id, is_best_seller')
          .in('id', ids)

        if (!books) {
          return new Response(JSON.stringify({ error: 'Libros no encontrados' }), { status: 404, headers })
        }

        for (const book of books) {
          const newValue = !book.is_best_seller
          await serverSupabase
            .from('books')
            .update({ manual_best_seller: newValue, is_best_seller: newValue })
            .eq('id', book.id)
        }

        return new Response(JSON.stringify({ success: true }), { status: 200, headers })
      }

      case 'delete': {
        const { data: books } = await serverSupabase
          .from('books')
          .select('id, title')
          .in('id', ids)

        if (!books || books.length === 0) {
          return new Response(JSON.stringify({ error: 'Libros no encontrados' }), { status: 404, headers })
        }

        const bookIds = books.map(b => b.id)

        const { data: ordersWithBooks } = await serverSupabase
          .from('orders')
          .select('items')

        const linkedBookIds = new Set<number>()
        for (const order of ordersWithBooks ?? []) {
          const items = order.items as Array<{ book_id: number }> | null
          if (items) {
            for (const item of items) {
              if (bookIds.includes(item.book_id)) {
                linkedBookIds.add(item.book_id)
              }
            }
          }
        }

        if (linkedBookIds.size > 0) {
          const linkedTitles = books
            .filter(b => linkedBookIds.has(b.id))
            .map(b => b.title)

          return new Response(JSON.stringify({
            error: `No se pueden eliminar libros con órdenes asociadas: ${linkedTitles.join(', ')}`,
          }), { status: 409, headers })
        }

        const { error } = await serverSupabase
          .from('books')
          .delete()
          .in('id', bookIds)

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), { status: 400, headers })
        }

        return new Response(JSON.stringify({ success: true }), { status: 200, headers })
      }

      default:
        return new Response(JSON.stringify({ error: 'Acción no válida' }), { status: 400, headers })
    }
  } catch {
    return new Response(JSON.stringify({ error: 'Error interno' }), { status: 500, headers })
  }
}
