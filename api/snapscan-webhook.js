import crypto from "crypto";

export const config = {
  api: {
    bodyParser: false,
  },
};

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on("data", (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });

    req.on("end", () => {
      resolve(Buffer.concat(chunks).toString("utf8"));
    });

    req.on("error", reject);
  });
}

function verifySignature(rawBody, authorization, authKey) {
  if (!authKey) {
    return true;
  }

  if (!authorization) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", authKey)
    .update(rawBody, "utf8")
    .digest("hex");

  const expectedHeader = `SnapScan signature=${expected}`;

  const received = Buffer.from(authorization, "utf8");
  const expectedBuffer = Buffer.from(expectedHeader, "utf8");

  if (received.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(received, expectedBuffer);
}

function getPayload(rawBody) {
  const params = new URLSearchParams(rawBody);
  const payload = params.get("payload");

  if (!payload) {
    throw new Error("Missing payload");
  }

  return JSON.parse(payload);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  try {
    const rawBody = await readRawBody(req);
    const authKey = process.env.SNAPSCAN_WEBHOOK_AUTH_KEY;
    const authorization = req.headers.authorization;

    if (!verifySignature(rawBody, authorization, authKey)) {
      console.error("SnapScan webhook signature verification failed");
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const payment = getPayload(rawBody);

    console.log("SnapScan webhook received:", JSON.stringify(payment));

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error("SnapScan webhook error:", error);

    return res.status(400).json({
      success: false,
      error: error.message || "Invalid webhook payload",
    });
  }
}
