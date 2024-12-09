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
        success_url: `${successUrl}?payment_success=true&email=${encodeURIComponent(email)}`,
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
    } catch (err) {
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    switch (event.type) {
      case 'checkout.session.completed':
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        if (checkoutSession.mode === 'subscription') {
          const subscription = await stripe.subscriptions.retrieve(checkoutSession.subscription as string);
          const email = checkoutSession.customer_details?.email?.toLowerCase(); // Ensure email is lowercase
          
          if (!email) {
            console.error('No email found in checkout session');
            break;
          }

          try {
            // First check if profile exists
            const { data: existingProfile, error: lookupError } = await supabase
              .from('profiles')
              .select('id')
              .eq('email', email)
              .single();

            if (lookupError) {
              console.error('Error looking up profile:', lookupError);
              break;
            }

            const profileData = {
              stripe_customer_id: checkoutSession.customer as string,
              subscription_status: 'active',
              subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString()
            };

            if (existingProfile) {
              // Update existing profile
              const { error: updateError } = await supabase
                .from('profiles')
                .update(profileData)
                .eq('id', existingProfile.id);

              if (updateError) {
                console.error('Error updating profile:', updateError);
                break;
              }
              console.log('Successfully updated profile for:', email);
            } else {
              // Create new profile
              const { error: insertError } = await supabase
                .from('profiles')
                .insert({
                  ...profileData,
                  email,
                  created_at: new Date().toISOString()
                });

              if (insertError) {
                console.error('Error creating profile:', insertError);
                break;
              }
              console.log('Successfully created profile for:', email);
            }
          } catch (error) {
            console.error('Error processing checkout session:', error);
          }
        }
        break;

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription;
        await supabase
          .from('profiles')
          .update({
            subscription_status: updatedSubscription.status === 'active' ? 'active' : 'past_due',
            subscription_end_date: new Date(updatedSubscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', updatedSubscription.customer);
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        await supabase
          .from('profiles')
          .update({
            subscription_status: 'canceled',
            subscription_end_date: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', deletedSubscription.customer);
        break;

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