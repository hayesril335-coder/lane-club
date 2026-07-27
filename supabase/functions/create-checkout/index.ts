import Stripe from 'npm:stripe@18.5.0'
import { createClient } from 'npm:@supabase/supabase-js@2.57.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing authorization')
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { checkoutType, alleyId, successUrl, cancelUrl } = await request.json()
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '')
    const priceId = checkoutType === 'owner'
      ? Deno.env.get('STRIPE_OWNER_PRICE_ID')
      : null
    if (checkoutType !== 'owner' && !alleyId) throw new Error('Alley is required for member checkout')

    let resolvedPriceId = priceId
    if (checkoutType === 'member') {
      const { data: alley, error } = await supabase
        .from('bowling_alleys')
        .select('id, name, membership_price_cents')
        .eq('id', alleyId)
        .single()
      if (error || !alley) throw new Error('Bowling alley not found')
      const price = await stripe.prices.create({
        currency: 'usd',
        unit_amount: alley.membership_price_cents,
        recurring: { interval: 'month' },
        product_data: { name: `${alley.name} membership` },
      })
      resolvedPriceId = price.id
    }
    if (!resolvedPriceId) throw new Error('Stripe price is not configured')

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: resolvedPriceId, quantity: 1 }],
      client_reference_id: user.id,
      metadata: { checkout_type: checkoutType, alley_id: alleyId ?? '' },
      success_url: successUrl,
      cancel_url: cancelUrl,
    })
    return Response.json({ url: session.url }, { headers: corsHeaders })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400, headers: corsHeaders })
  }
})
