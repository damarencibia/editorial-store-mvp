import type { APIRoute } from 'astro'
import { supabase } from '../../../lib/supabase'

export const GET: APIRoute = async ({ url }) => {
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1'))
  const perPage = Math.min(50, Math.max(1, parseInt(url.searchParams.get('perPage') ?? '24')))
  const sort = url.searchParams.get('sort') ?? 'all'
  const authorIds = url.searchParams.get('authors')?.split(',').map(Number).filter(Boolean) ?? []
  const publishers = url.searchParams.get('publishers')?.split(',').filter(Boolean) ?? []

  let query = supabase
    .from('books')
    .select('*, authors!left(name)', { count: 'exact' })
    .eq('is_visible', true)

  if (authorIds.length > 0) {
    query = query.in('author_id', authorIds)
  }

  if (publishers.length > 0) {
    query = query.in('publisher', publishers)
  }

  if (sort !== 'all') {
    switch (sort) {
      case 'price_asc':
        query = query.order('price', { ascending: true })
        break
      case 'price_desc':
        query = query.order('price', { ascending: false })
        break
      case 'best_sellers':
        query = query.order('sales_count', { ascending: false })
        break
    }
  }

  const from = (page - 1) * perPage
  const to = from + perPage - 1

  const { data: books, count: total, error } = await query.range(from, to)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const totalPages = Math.ceil((total ?? 0) / perPage)

  return new Response(
    JSON.stringify({
      books: (books ?? []).map((b: any) => ({
        id: b.id,
        slug: b.slug,
        title: b.title,
        author: b.authors?.name ?? 'Autor desconocido',
        author_id: b.author_id,
        price: b.price,
        cover_url: b.cover_url,
        publisher: b.publisher,
        is_best_seller: b.is_best_seller,
        sales_count: b.sales_count,
      })),
      total: total ?? 0,
      page,
      perPage,
      totalPages,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    },
  )
}
