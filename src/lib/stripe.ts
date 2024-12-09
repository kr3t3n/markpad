import { supabase } from './supabase';

export async function createCheckoutSession(email: string, interval: 'monthly' | 'annual' = 'monthly') {
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

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ 
        email,
        interval,
        successUrl: `${window.location.origin}/auth/callback`,
        cancelUrl: `${window.location.origin}/auth`
      })
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Checkout response error:', text);
      try {
        const data = JSON.parse(text);
        throw new Error(data.error || 'Failed to create checkout session');
      } catch (e) {
        throw new Error('Failed to create checkout session');
      }
    }

    const data = await response.json();
    
    if (!response.ok || !data.url) {
      const error = data.error || 'Failed to create checkout session';
      console.error('Checkout error:', error);
      throw new Error(error);
    }

    return { url: data.url, error: null };
  } catch (error) {
    console.error('Checkout error:', error);
    return { 
      url: null, 
      error: error instanceof Error ? error.message : 'Failed to initiate checkout'
    };
  }
}