import Stripe from 'npm:stripe@18.5.0'
import { createClient } from 'npm:@supabase/supabase-js@2.57.0'

Deno.serve(async (request) => {
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '')
  const signature = request.headers.get('stripe-signature')
  if (!signature) return new Response('Missing Stripe signature', { status: 400 })

  try {
    const event = await stripe.webhooks.constructEventAsync(
      await request.text(),
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '',
    )
    const admin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const checkoutType = session.metadata?.checkout_type
      const userId = session.client_reference_id
      if (checkoutType === 'member' && userId && session.metadata?.alley_id) {
        const { data: alley } = await admin.from('bowling_alleys')
          .select('membership_price_cents')
          .eq('id', session.metadata.alley_id)
          .single()
        if (alley) await admin.from('memberships').upsert({
          member_id: userId,
          alley_id: session.metadata.alley_id,
          monthly_price_cents: alley.membership_price_cents,
          stripe_customer_id: String(session.customer),
          stripe_subscription_id: String(session.subscription),
          status: 'active',
        }, { onConflict: 'member_id,alley_id' })
      }
    }
    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (error) {
    return new Response(`Webhook Error: ${error.message}`, { status: 400 })
  }
})
