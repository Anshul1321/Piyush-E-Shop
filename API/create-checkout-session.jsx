import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { cartItems } = req.body;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: cartItems.map(item => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.name,
            },
            unit_amount: item.price * 100, // Stripe needs amount in cents
          },
          quantity: item.quantity,
        })),
        success_url: `${req.headers.origin}/success`,
        cancel_url: `${req.headers.origin}/cancel`,
      });

      res.status(200).json({ id: session.id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
