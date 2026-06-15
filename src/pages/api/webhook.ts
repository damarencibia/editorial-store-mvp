import type { APIRoute } from 'astro'
import { stripe } from '../../lib/stripe'
import { supabaseAdmin } from '../../lib/supabase-admin'

export const POST: APIRoute = async ({ request }) => {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return new Response(JSON.stringify({ error: 'Missing stripe-signature header' }), { status: 400 })
  }

  const webhookSecret = import.meta.env.STRIPE_WEBHOOK_SECRET
  let event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object

    const items = session.metadata?.items
      ? JSON.parse(session.metadata.items)
      : []

    const { error: orderErr } = await supabaseAdmin.from('orders').insert({
      customer_email: session.customer_details?.email ?? null,
      items,
      total: session.amount_total ?? 0,
      stripe_session_id: session.id,
      status: 'paid',
    })

    if (orderErr) {
      console.error('Error saving order:', orderErr)
      return new Response(JSON.stringify({ error: 'Failed to save order' }), { status: 500 })
    }

    for (const item of items) {
      const { data: book, error: readErr } = await supabaseAdmin
        .from('books')
        .select('sales_count')
        .eq('id', item.bookId)
        .single()

      if (readErr || !book) {
        console.error(`Failed to read sales_count for book ${item.bookId}:`, readErr)
        continue
      }

      const { error: updateErr } = await supabaseAdmin
        .from('books')
        .update({ sales_count: book.sales_count + item.quantity })
        .eq('id', item.bookId)

      if (updateErr) {
        console.error(`Failed to update sales_count for book ${item.bookId}:`, updateErr)
      }
    }

    await syncTrending()

    console.log('Order saved and sales updated:', session.id)
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

async function syncTrending() {
  try {
    await supabaseAdmin.rpc('sync_trending')
    return
  } catch {
    console.warn('sync_trending RPC not available, calculating trending from JS')
  }

  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()

  const { data: orders, error: ordersErr } = await supabaseAdmin
    .from('orders')
    .select('items')
    .gte('created_at', fourteenDaysAgo)
    .eq('status', 'paid')

  if (ordersErr) {
    console.error('Failed to fetch recent orders for trending:', ordersErr)
    return
  }

  const salesMap = new Map<number, number>()
  for (const order of orders ?? []) {
    for (const item of order.items ?? []) {
      const bookId: number = item.bookId
      const qty: number = item.quantity ?? 1
      salesMap.set(bookId, (salesMap.get(bookId) ?? 0) + qty)
    }
  }

  const top20 = [...salesMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([bookId]) => bookId)

  await supabaseAdmin.from('books').update({ is_trending: false }).neq('is_trending', false)

  if (top20.length > 0) {
    const { error: trendingErr } = await supabaseAdmin
      .from('books')
      .update({ is_trending: true })
      .in('id', top20)

    if (trendingErr) {
      console.error('Failed to update trending flags:', trendingErr)
    }
  }
}
