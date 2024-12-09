import { supabase } from './supabase';

export async function createCheckoutSession(email: string, plan: 'monthly' | 'yearly' = 'yearly') {
  try {
    // First check if user already exists with active subscription
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status')
      .eq('email', email)
      .single();

    if (profile?.subscription_status === 'active') {
      return { url: null, error: 'An active subscription already exists for this email' };
    }

    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: { 
        email,
        plan
      }
    });

    if (error) {
      console.error('Error creating checkout session:', error);
      return { error: 'Failed to create checkout session' };
    }

    if (!data?.url) {
      return { error: 'No checkout URL returned' };
    }

    return { url: data.url, error: null };
  } catch (error) {
    console.error('Error in createCheckoutSession:', error);
    return { error: 'An unexpected error occurred' };
  }
}