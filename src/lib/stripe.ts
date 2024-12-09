import { supabase } from './supabase';

export async function createCheckoutSession(email: string) {
  try {
    const response = await fetch('/.netlify/functions/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email,
        successUrl: `${window.location.origin}/auth/callback`,
        cancelUrl: `${window.location.origin}/auth`
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const { url } = await response.json();
    return { url, error: null };
  } catch (error) {
    console.error('Checkout error:', error);
    return { url: null, error: 'Failed to initiate checkout' };
  }
}