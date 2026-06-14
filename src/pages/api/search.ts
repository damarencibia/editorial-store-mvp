import type { APIRoute } from 'astro'
import { supabase } from '../../lib/supabase'

export const GET: APIRoute = async ({ url }) => {
  const q = (url.searchParams.get('q') ?? '').trim()

  if (!q || q.length < 2) {
    return new Response(JSON.stringify({ books: [], authors: [], collections: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const pattern = `%${q}%`

  const [booksRes, authorsRes, collectionsRes] = await Promise.all([
    supabase
      .from('books')
      .select('id, slug, title, price, cover_url, is_trending, authors!left(name)')
      .eq('is_visible', true)
      .ilike('title', pattern)
      .order('sales_count', { ascending: false })
      .limit(5),

    supabase
      .from('authors')
      .select('id, name, slug, photo_url')
      .ilike('name', pattern)
      .order('name')
      .limit(5),

    supabase
      .from('collections')
      .select('id, name, slug, cover_url, description')
      .ilike('name', pattern)
      .order('name')
      .limit(5),
  ])

  const books = (booksRes.data ?? []).map((b: any) => ({
    id: b.id,
    title: b.title,
    slug: b.slug,
    price: b.price,
    cover_url: b.cover_url,
    is_trending: b.is_trending,
    author: b.authors?.name ?? null,
  }))

  const authors = (authorsRes.data ?? []).map((a: any) => ({
    id: a.id,
    name: a.name,
    slug: a.slug,
    photo_url: a.photo_url,
  }))

  const collections = (collectionsRes.data ?? []).map((c: any) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    cover_url: c.cover_url,
    description: c.description,
  }))

  return new Response(JSON.stringify({ books, authors, collections }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
