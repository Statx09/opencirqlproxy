import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, amount } = req.body || {};

  if (!userId || !amount) {
    return res.status(400).json({ error: "Missing userId or amount" });
  }

  const reference = `cirql-${userId}-${Date.now()}`;

  const baseUrl =
    process.env.APP_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:5173");

  const successUrl = `${baseUrl}/?payment=success`;
  const failureUrl = `${baseUrl}/?payment=failed`;

  const paymentUrl =
    `https://pos.snapscan.io/qr/e16H-xE6` +
    `?id=${encodeURIComponent(reference)}` +
    `&amount=${Math.round(Number(amount) * 100)}` +
    `&strict=true` +
    `&s_url=${encodeURIComponent(successUrl)}` +
    `&f_url=${encodeURIComponent(failureUrl)}` +
    `&r_url=${encodeURIComponent(baseUrl + "/")}`;

  return res.status(200).json({ paymentUrl });
}

