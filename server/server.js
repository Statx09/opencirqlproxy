import express from "express";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors()); // allow frontend requests
app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Withdraw endpoint
app.post("/api/withdraw", async (req, res) => {
  const { userId, amount, walletId } = req.body;

  try {
    // Get user from Supabase
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.totalEarned < amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Insufficient balance" });
    }

    // ===== Stripe payout placeholder =====
    // You need a connected account per user
    // const payout = await stripe.payouts.create({
    //   amount: Math.floor(amount * 100), // cents
    //   currency: "usd",
    //   destination: user.stripeAccountId,
    // });

    // ===== Ko-fi payout placeholder =====
    // const kofiLink = `https://ko-fi.com/${user.kofiUsername}?amount=${amount}`;

    // ===== Crypto payout placeholder =====
    // send crypto to walletId here

    // Reset user's balance after payout
    await supabase
      .from("users")
      .update({ totalEarned: 0 })
      .eq("id", userId);

    res.json({
      success: true,
      message: "Withdrawal processed successfully!",
      // payout, kofiLink
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Withdraw API running on port ${PORT}`));
