import { serve } from 'https://deno.fresh.dev/std@v1/http/server.ts';
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
      case 'checkout.session.completed': {
        const session = event.data.object;
        const { email } = session.customer_details || {};

        if (!email || !session.customer) {
          console.error('Missing required data:', { email, customer: session.customer });
          return new Response('Missing required data', { status: 400 });
        }

        try {
          // Create user if doesn't exist
          const { data: existingUser } = await supabase.auth.admin.listUsers({
            filter: { email }
          });

          if (!existingUser?.users?.length) {
            const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
              email,
              email_confirm: true,
              user_metadata: { stripe_customer_id: session.customer }
            });

            if (createError) {
              console.error('Failed to create user:', createError);
              return new Response('Failed to create user', { 
                status: 500,
                headers: corsHeaders 
              });
            }
          }

          // Update profile
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
              subscription_status: 'active',
              stripe_customer_id: session.customer,
              email
            })
            .eq('email', email);

          if (updateError) {
            console.error('Failed to update profile:', updateError);
            return new Response('Failed to update profile', { 
              status: 500,
              headers: corsHeaders 
            });
          }
        } catch (error) {
          console.error('Database error:', error);
          return new Response('Database error', { 
            status: 500,
            headers: corsHeaders 
          });
        }
        break;
      }

      case 'customer.subscription.deleted':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const status = subscription.status === 'active' ? 'active' : 'inactive';

        await supabase
          .from('profiles')
          .update({ subscription_status: status })
          .eq('stripe_customer_id', subscription.customer);
        break;
      }
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