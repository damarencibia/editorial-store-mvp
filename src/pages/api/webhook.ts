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

    const { error } = await supabaseAdmin.from('orders').insert({
      customer_email: session.customer_details?.email ?? null,
      items,
      total: session.amount_total ?? 0,
      stripe_session_id: session.id,
      status: 'paid',
    })

    if (error) {
      console.error('Error saving order:', error)
      return new Response(JSON.stringify({ error: 'Failed to save order' }), { status: 500 })
    }

    for (const item of items) {
      const { error: rpcErr } = await supabaseAdmin.rpc('increment_sales_count', {
        book_id: item.bookId,
        quantity: item.quantity,
      })
      if (rpcErr) {
        console.warn('increment_sales_count RPC failed, falling back to direct update:', rpcErr)
        const { data: book } = await supabaseAdmin
          .from('books')
          .select('sales_count')
          .eq('id', item.bookId)
          .single()
        await supabaseAdmin
          .from('books')
          .update({ sales_count: (book?.sales_count ?? 0) + item.quantity })
          .eq('id', item.bookId)
      }
    }

    const { error: syncErr } = await supabaseAdmin.rpc('sync_trending')
    if (syncErr) {
      console.warn('sync_trending RPC failed, trending flags may be stale:', syncErr)
    }

    console.log('Order saved and sales updated:', session.id)
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
