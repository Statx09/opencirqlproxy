// src/TipModal.jsx
import React, { useState } from "react";

export default function TipModal({ host, onClose }) {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USDT");
  const [showQR, setShowQR] = useState(false);

  const submit = () => {
    if (!amount || Number(amount) <= 0) return alert("Enter a valid amount");
    // Implement payment flow here (Stripe or USDT flow)
    alert(`(Demo) Tipping ${host.name} ${amount} ${currency}`);
    onClose();
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex",
      justifyContent: "center", alignItems: "center", zIndex: 2000
    }}>
      <div style={{ width: 360, background: "#fff", padding: 20, borderRadius: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>Tip {host.name}</h3>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ marginTop: 12 }}>
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd", marginBottom: 12 }}
          />

          <select value={currency} onChange={(e) => setCurrency(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 8 }}>
            <option value="USDT">USDT</option>
            <option value="USD">USD</option>
          </select>

          {currency === "USDT" && (
            <div style={{ marginTop: 12 }}>
              <button onClick={() => setShowQR(!showQR)} style={{ padding: 10, width: "100%", borderRadius: 8, background: "#111827", color: "#fff", border: "none" }}>
                {showQR ? "Hide QR" : "Show QR / Wallet"}
              </button>

              {showQR && (
                <div style={{ textAlign: "center", marginTop: 12 }}>
                  <img src="/placeholder-qr.png" alt="qr" style={{ width: 180, height: 180, objectFit: "cover" }} />
                  <div style={{ marginTop: 8, fontSize: 12, color: "#444" }}>
                    {host.wallet || "No wallet set — host will provide deposit address"}
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button onClick={onClose} style={{ flex: 1, padding: 10, borderRadius: 8, background: "#e5e7eb", border: "none" }}>Cancel</button>
            <button onClick={submit} style={{ flex: 1, padding: 10, borderRadius: 8, background: "#0ea5e9", color: "#fff", border: "none" }}>Send Tip</button>
          </div>
        </div>
      </div>
    </div>
  );
}
