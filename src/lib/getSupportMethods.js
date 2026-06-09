export function getSupportMethods(host) {
  if (!host) return [];

  const methods = [];

  // PayPal
  if (host.paypal_link) {
    methods.push({
      id: "paypal",
      label: "PayPal",
      type: "link",
      value: host.paypal_link,
    });
  }

  // Ko-fi
  if (host.kofi) {
    methods.push({
      id: "kofi",
      label: "Ko-fi",
      type: "link",
      value: host.kofi,
    });
  }

  // Crypto link (generic page / Solana / etc)
  if (host.crypto_link) {
    methods.push({
      id: "crypto",
      label: "Crypto",
      type: "crypto",
      value: host.crypto_link,
    });
  }

  // USDT wallet (direct copy)
  if (host.usdt_wallet) {
    methods.push({
      id: "usdt",
      label: "USDT Wallet",
      type: "wallet",
      value: host.usdt_wallet,
    });
  }

  return methods;
}