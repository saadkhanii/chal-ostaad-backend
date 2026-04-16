// api/createPaymentIntent.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, currency, jobId, clientId } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    console.log(`Creating PaymentIntent: amount=${amount}, jobId=${jobId}`);

    // Convert PKR to USD cents (1 USD ≈ 280 PKR)
    const amountInCents = Math.round((amount / 280) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency || 'usd',
      metadata: {
        jobId: jobId || '',
        clientId: clientId || '',
      },
      automatic_payment_methods: { enabled: true },
    });

    console.log(`PaymentIntent created: ${paymentIntent.id}`);

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Stripe error:', error.message);
    res.status(500).json({ error: error.message });
  }
}