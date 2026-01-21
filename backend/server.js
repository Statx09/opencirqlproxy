// server.js
import express from "express";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

// ---- DEV STRIPE STUB (NO STRIPE ACCOUNT REQUIRED) ----
const stripe = {
  checkout: {
    sessions: {
      create: async () => ({
        url: "https://example.com/dev-tip-success"
      })
    }
  }
};
// -----------------------------------------------------

app.post("/create-tip-session", async (req, res) => {
  try {
    const { hostId, amount } = req.body;

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
      success_url: `http://localhost:3000/?tip=success`,
      cancel_url: `http://localhost:3000/?tip=cancel`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "server error" });
  }
});

app.listen(process.env.PORT || 3000, () =>
  console.log("Tip server running (DEV MODE, Stripe stubbed)")
);

