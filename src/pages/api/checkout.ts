import type { APIRoute } from 'astro'
import { stripe } from '../../lib/stripe'

interface CartItemPayload {
  bookId: number
  slug: string
  title: string
  price: number
  quantity: number
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const { items } = await request.json() as { items: CartItemPayload[] }

    if (!items || items.length === 0) {
      return new Response(JSON.stringify({ error: 'Cart is empty' }), { status: 400 })
    }

    const totalCents = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    if (totalCents < 50) {
      return new Response(JSON.stringify({ error: 'Total must be at least $0.50' }), { status: 400 })
    }

    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.title,
        },
        unit_amount: item.price,
      },
      quantity: item.quantity,
    }))

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${import.meta.env.PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${import.meta.env.PUBLIC_SITE_URL}/cancel`,
      metadata: {
        items: JSON.stringify(items),
      },
    })

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Checkout error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}
