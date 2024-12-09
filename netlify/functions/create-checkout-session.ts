import { Handler } from '@netlify/functions';
import Stripe from 'stripe';

const PRICE_LOOKUP = {
  monthly: process.env.STRIPE_PRICE_MONTHLY_ID,
  annual: process.env.STRIPE_PRICE_ANNUAL_ID
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    };
  }

  try {
    const { email, successUrl, cancelUrl, interval = 'monthly' } = JSON.parse(event.body || '{}');

    if (!email || !successUrl || !cancelUrl) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    const priceId = PRICE_LOOKUP[interval as keyof typeof PRICE_LOOKUP];
    if (!priceId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid pricing interval' })
      };
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: email,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url })
    };
  } catch (error) {
    console.error('Checkout error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create checkout session' })
    };
  }
};