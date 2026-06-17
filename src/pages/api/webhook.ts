import type { APIRoute } from 'astro'
import { stripe } from '../../lib/stripe'
import { supabaseAdmin } from '../../lib/supabase-admin'

export const POST: APIRoute = async ({ request }) => {
  if (!import.meta.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('SUPABASE_SERVICE_ROLE_KEY is not set — book sales_count updates may fail')
  }

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

    const sd = session.shipping_details
    const shippingName = sd?.name ?? null
    const shippingAddress = sd?.address ? {
      line1: sd.address.line1 ?? null,
      line2: sd.address.line2 ?? null,
      city: sd.address.city ?? null,
      state: sd.address.state ?? null,
      postal_code: sd.address.postal_code ?? null,
      country: sd.address.country ?? null,
    } : null
    const shippingPhone = session.customer_details?.phone ?? null
    const shippingCountry = session.metadata?.country ?? null
    const userId = session.metadata?.user_id ?? null

    let orderId: number | null = null
    const { error: orderErr } = await supabaseAdmin.from('orders').insert({
      customer_email: session.customer_details?.email ?? null,
      user_id: userId,
      items,
      total: session.amount_total ?? 0,
      stripe_session_id: session.id,
      status: 'paid',
      shipping_name: shippingName,
      shipping_address: shippingAddress,
      shipping_phone: shippingPhone,
      shipping_country: shippingCountry,
    })

    if (orderErr) {
      console.error('Error saving order via insert, trying RPC fallback:', orderErr)
      const { data: fallbackId, error: fallbackErr } = await supabaseAdmin.rpc('insert_order', {
        p_email: session.customer_details?.email ?? null,
        p_items: items,
        p_total: session.amount_total ?? 0,
        p_session_id: session.id,
        p_status: 'paid',
      })
      if (fallbackErr) {
        console.error('Error saving order via RPC fallback:', fallbackErr)
        return new Response(JSON.stringify({ error: 'Failed to save order' }), { status: 500 })
      }
      orderId = fallbackId
      console.log('Order saved via RPC fallback, id:', orderId)
    } else {
      orderId = 1
    }

    let updated = 0
    for (const item of items) {
      const { data: book, error: readErr } = await supabaseAdmin
        .from('books')
        .select('sales_count')
        .eq('id', item.bookId)
        .maybeSingle()

      if (readErr) {
        console.error(`[sales] read error book ${item.bookId}: ${readErr.message}`)
        continue
      }
      if (!book) {
        console.error(`[sales] book ${item.bookId} not found — possible id mismatch with items metadata`)
        continue
      }

      const currentQty = item.quantity ?? 1
      const newSales = book.sales_count + currentQty
      console.log(`[sales] book ${item.bookId}: ${book.sales_count} + ${currentQty} = ${newSales}`)

      const { error: updateErr } = await supabaseAdmin
        .from('books')
        .update({ sales_count: newSales })
        .eq('id', item.bookId)

      if (updateErr) {
        console.error(`[sales] update error book ${item.bookId}: ${updateErr.message}`)
      } else {
        updated++
      }
    }

    await syncTrending()

    console.log(`Order ${session.id}: ${items.length} items, ${updated} sales_count updated`)
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

async function syncTrending() {
  const { error: rpcErr } = await supabaseAdmin.rpc('sync_trending')
  if (!rpcErr) return

  console.warn('sync_trending RPC failed, using JS fallback:', rpcErr)

  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()

  const { data: orders, error: ordersErr } = await supabaseAdmin
    .from('orders')
    .select('items')
    .gte('created_at', fourteenDaysAgo)
    .eq('status', 'paid')

  if (ordersErr) {
    console.error('Failed to fetch orders for trending:', ordersErr)
    return
  }

  const salesMap = new Map<number, number>()
  for (const order of orders ?? []) {
    for (const item of order.items ?? []) {
      const id: number = item.bookId
      const qty: number = item.quantity ?? 1
      salesMap.set(id, (salesMap.get(id) ?? 0) + qty)
    }
  }

  const top20 = [...salesMap.entries()]
    .filter(([, qty]) => qty >= 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([id]) => id)

  // Reset only auto-trending books (skip manual_trending = true)
  const { error: resetErr } = await supabaseAdmin
    .from('books')
    .update({ is_trending: false })
    .eq('manual_trending', false)
    .eq('is_trending', true)
  if (resetErr) console.error('Failed to reset trending:', resetErr)

  if (top20.length > 0) {
    const { error: setErr } = await supabaseAdmin
      .from('books')
      .update({ is_trending: true })
      .in('id', top20)
      .eq('is_visible', true)
    if (setErr) console.error('Failed to set trending:', setErr)
  }
}
