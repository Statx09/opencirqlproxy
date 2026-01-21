import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function handler(req, res) {
  try {
    const { amount, type, hostId, userId, referrerId } = req.body;

    if (!amount || !type) return res.status(400).json({ error: "Missing amount or type" });

    const metadata = { type, hostId: hostId || null, userId: userId || null, referrerId: referrerId || null };

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      metadata,
    });

    return res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
