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

    console.log('Order saved — trigger trg_process_order_sales will update sales_count:', session.id)
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
