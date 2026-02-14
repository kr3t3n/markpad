import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import Stripe from 'https://esm.sh/stripe@13.11.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getUserIdByEmail(email: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email.toLowerCase())
    .single();

  if (error || !data) {
    console.error('Error getting user ID:', error);
    return null;
  }

  return data.id;
}

async function upsertSubscription(subscriptionData: any) {
  const { data, error } = await supabase
    .from('subscriptions')
    .upsert(subscriptionData, { onConflict: 'stripe_subscription_id' })
    .select()
    .single();

  if (error) {
    console.error('Error upserting subscription:', error);
    throw error;
  }

  return data;
}

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Handle POST request for creating checkout session
    if (req.method === 'POST') {
      const { email, interval, successUrl, cancelUrl } = await req.json();
      
      const priceId = interval === 'annual' 
        ? Deno.env.get('STRIPE_PRICE_ANNUAL_ID')
        : Deno.env.get('STRIPE_PRICE_MONTHLY_ID');

      if (!priceId) {
        return new Response(
          JSON.stringify({ error: 'Price ID not configured' }), 
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl,
        customer_email: email,
      });

      return new Response(
        JSON.stringify({ url: session.url }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle Stripe webhook events
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response('No signature', { status: 400 });
    }

    const body = await req.text();
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';
    let event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      
      // Log the webhook event
      await supabase
        .from('stripe_webhook_events')
        .insert({
          type: event.type,
          data: event.data.object,
        });
        
    } catch (err) {
      // Log failed webhook
      await supabase
        .from('stripe_webhook_events')
        .insert({
          type: 'unknown',
          data: { body },
          status: 'error',
          error_message: err.message
        });
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription') {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          const email = session.customer_details?.email;
          
          if (!email) {
            console.error('No email found in checkout session');
            break;
          }

          const userId = await getUserIdByEmail(email);
          if (!userId) {
            console.error('No user found for email:', email);
            break;
          }

          await upsertSubscription({
            user_id: userId,
            stripe_customer_id: session.customer,
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            price_id: subscription.items.data[0].price.id,
            quantity: subscription.items.data[0].quantity,
            cancel_at_period_end: subscription.cancel_at_period_end,
            cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
            canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
            current_period_start: new Date(subscription.current_period_start * 1000),
            current_period_end: new Date(subscription.current_period_end * 1000),
            trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
            trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
          });
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
      case 'customer.subscription.trial_will_end':
      case 'customer.subscription.pending_update_applied':
      case 'customer.subscription.pending_update_expired': {
        const subscription = event.data.object as Stripe.Subscription;
        
        await upsertSubscription({
          stripe_subscription_id: subscription.id,
          status: subscription.status,
          price_id: subscription.items.data[0].price.id,
          quantity: subscription.items.data[0].quantity,
          cancel_at_period_end: subscription.cancel_at_period_end,
          cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
          canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
          current_period_start: new Date(subscription.current_period_start * 1000),
          current_period_end: new Date(subscription.current_period_end * 1000),
          trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
          trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
          ended_at: subscription.ended_at ? new Date(subscription.ended_at * 1000) : null,
        });
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          await upsertSubscription({
            stripe_subscription_id: subscription.id,
            status: 'past_due',
          });
        }
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        // This is handled by checkout.session.completed
        console.log('New subscription created:', subscription.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(`Webhook Error: ${error.message}`, { 
      status: 400,
      headers: corsHeaders 
    });
  }
});