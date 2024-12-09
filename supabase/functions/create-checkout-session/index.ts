import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  // This is needed to use the Fetch API rather than Node's http client
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
})

const MONTHLY_PRICE_ID = Deno.env.get('STRIPE_MONTHLY_PRICE_ID')
const YEARLY_PRICE_ID = Deno.env.get('STRIPE_YEARLY_PRICE_ID')

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get request body
    const { email, plan } = await req.json()

    if (!email) {
      throw new Error('Email is required')
    }

    // Determine price ID based on plan
    const priceId = plan === 'monthly' ? MONTHLY_PRICE_ID : YEARLY_PRICE_ID

    if (!priceId) {
      throw new Error(`Price ID not found for plan: ${plan}`)
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      success_url: `${req.headers.get('origin')}/auth/callback?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/signup`,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      client_reference_id: email,
      customer_email: email,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      automatic_tax: { enabled: true },
    })

    // Return the session URL
    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Checkout session error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      },
    )
  }
})
