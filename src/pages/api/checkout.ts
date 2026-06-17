import type { APIRoute } from 'astro'
import { stripe } from '../../lib/stripe'
import { getServerSupabase } from '../../lib/auth'
import { serializeCookie } from '../../lib/utils'

interface CartItemPayload {
  bookId: number
  slug: string
  title: string
  price: number
  quantity: number
}

export const POST: APIRoute = async ({ request }) => {
  const headers = new Headers()
  const serverSupabase = getServerSupabase(request, (name, value, options) => {
    headers.append('Set-Cookie', serializeCookie(name, value, options))
  })

  const { data: { user } } = await serverSupabase.auth.getUser()
  if (!user) {
    return new Response(JSON.stringify({ error: 'Debes iniciar sesión para comprar' }), { status: 401 })
  }

  try {
    const { items, country } = await request.json() as { items: CartItemPayload[]; country: string }

    if (!items || items.length === 0) {
      return new Response(JSON.stringify({ error: 'Cart is empty' }), { status: 400 })
    }

    const allowedCountries = ['US', 'ES']
    if (!allowedCountries.includes(country)) {
      return new Response(JSON.stringify({ error: 'País no válido' }), { status: 400 })
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
      customer_email: user.email,
      line_items: lineItems,
      shipping_address_collection: {
        allowed_countries: [country],
      },
      phone_number_collection: { enabled: true },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 0, currency: 'usd' },
            display_name: 'Envío estándar (7-10 días)',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 7 },
              maximum: { unit: 'business_day', value: 10 },
            },
          },
        },
      ],
      success_url: `${import.meta.env.PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${import.meta.env.PUBLIC_SITE_URL}/checkout`,
      metadata: {
        items: JSON.stringify(items),
        user_id: user.id,
        country,
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
