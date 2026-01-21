import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { hostId, amount } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: `Tip for host ${hostId || ""}` },
          unit_amount: Math.round((amount || 5) * 100),
        },
        quantity: 1,
      }],
      success_url: `${process.env.FRONTEND_URL}/?tip=success`,
      cancel_url: `${process.env.FRONTEND_URL}/?tip=cancel`,
    });
    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "server error" });
  }
}

