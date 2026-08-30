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
  const paymentUrl =
    `https://pos.snapscan.io/qr/e16H-xE6?id=${encodeURIComponent(reference)}` +
    `&amount=${Math.round(Number(amount) * 100)}&strict=true`;

  return res.status(200).json({ paymentUrl });
}
