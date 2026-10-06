import React, { useState } from "react";

export default function SayThanksModal({ host, onClose }) {
  const [amount, setAmount] = useState(3);
  const [method, setMethod] = useState("kofi");

  const name = host?.alias || host?.name || "creator";

  const kofi = host?.kofi;
  const crypto = host?.usdtwallet || host?.usdt_wallet;
  const stripe = host?.stripe;

  const handlePay = () => {
    if (method === "kofi") {
      if (!kofi) return alert("No Ko-fi link set");
      window.open(kofi, "_blank");
    }

    if (method === "crypto") {
      if (!crypto) return alert("No crypto wallet set");
      navigator.clipboard.writeText(crypto);
      alert("Wallet copied");
    }

    if (method === "stripe") {
      if (!stripe) return alert("No payment link set");
      window.open(stripe, "_blank");
    }

    onClose();
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        {/* HEADER */}
        <div style={header}>
          <h2 style={{ margin: 0 }}>Say Thanks 💛</h2>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>

        <p style={{ fontSize: 13, color: "#555" }}>
          Support {name} instantly
        </p>

        {/* AMOUNT */}
        <div style={section}>
          <p style={label}>Amount</p>

          <div style={row}>
            {[1, 3, 5, 10].map((v) => (
              <button
                key={v}
                onClick={() => setAmount(v)}
                style={{
                  ...btn,
                  background: amount === v ? "#7c3aed" : "#eee",
                  color: amount === v ? "#fff" : "#111",
                }}
              >
                ${v}
              </button>
            ))}
          </div>
        </div>

        {/* METHOD */}
        <div style={section}>
          <p style={label}>Method</p>

          <div style={row}>
            <button
              onClick={() => setMethod("kofi")}
              style={methodBtn(method === "kofi")}
            >
              Ko-fi
            </button>

            <button
              onClick={() => setMethod("crypto")}
              style={methodBtn(method === "crypto")}
            >
              Crypto
            </button>

            <button
              onClick={() => setMethod("stripe")}
              style={methodBtn(method === "stripe")}
            >
              Card
            </button>
          </div>
        </div>

        {/* INFO */}
        <div style={info}>
          {method === "kofi" && <p>Redirect to Ko-fi for payment</p>}
          {method === "crypto" && <p>Wallet will be copied</p>}
          {method === "stripe" && <p>Open secure payment link</p>}
        </div>

        {/* ACTION */}
        <button onClick={handlePay} style={payBtn}>
          Continue
        </button>
      </div>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const modal = {
  width: 420,
  background: "#fff",
  borderRadius: 16,
  padding: 16,
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const closeBtn = {
  border: "none",
  background: "#111827",
  color: "#fff",
  width: 30,
  height: 30,
  borderRadius: "50%",
  cursor: "pointer",
};

const section = {
  marginTop: 12,
};

const label = {
  fontSize: 13,
  fontWeight: 700,
  marginBottom: 6,
};

const row = {
  display: "flex",
  gap: 8,
};

const btn = {
  flex: 1,
  padding: 10,
  borderRadius: 10,
  border: "none",
  cursor: "pointer",
  fontWeight: 700,
};

const methodBtn = (active) => ({
  flex: 1,
  padding: 10,
  borderRadius: 10,
  border: "none",
  cursor: "pointer",
  fontWeight: 700,
  background: active ? "#7c3aed" : "#eee",
  color: active ? "#fff" : "#111",
});

const info = {
  marginTop: 10,
  fontSize: 13,
  color: "#555",
  background: "#f3f4f6",
  padding: 10,
  borderRadius: 10,
};

const payBtn = {
  marginTop: 14,
  width: "100%",
  padding: 12,
  borderRadius: 12,
  border: "none",
  background: "#7c3aed",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};