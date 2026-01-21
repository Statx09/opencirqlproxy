import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function handler(req) {
  try {
    const { userId } = await req.json();
    const earlyUser = false; // implement your early-user check with Supabase later

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: earlyUser ? "payment" : "subscription",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: earlyUser ? "Lifetime Access" : "Cirql Subscription",
            },
            unit_amount: earlyUser ? 0 : 200,
            recurring: earlyUser ? undefined : { interval: "month" },
          },
          quantity: 1,
        },
      ],
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/cancel`,
      metadata: { userId },
    });

    return new Response(JSON.stringify({ sessionId: session.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
