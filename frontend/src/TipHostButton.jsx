// src/TipHostButton.jsx
import React, { useState } from "react";
import QRModal from "./QRModal";

export default function TipHostButton({ host, onClose }) {
  const [method, setMethod] = useState("USDT");
  const [amount, setAmount] = useState("");
  const [showQR, setShowQR] = useState(false);

  const handleTip = () => {
    if (!amount) return alert("Enter an amount to tip");
    if (method === "QR") {
      setShowQR(true);
    } else {
      alert(`Tipping ${host.name} ${amount} ${method}`);
      onClose();
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.4)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999
    }}>
      <div style={{ background: "#fff", padding: 24, borderRadius: 12, width: 320 }}>
        <h3>Tip {host.name}</h3>
        <div style={{ margin: "12px 0" }}>
          <label>Amount</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc", marginTop: 4 }}
          />
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {["USD", "USDT", "QR"].map(m => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              style={{
                flex: 1,
                padding: 8,
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                backgroundColor: method === m ? "#22c55e" : "#e5e7eb",
                color: method === m ? "#fff" : "#111827"
              }}
            >
              {m}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleTip}
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 6,
              border: "none",
              backgroundColor: "#0EA5E9",
              color: "#fff",
              cursor: "pointer"
            }}
          >
            Tip
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 6,
              border: "none",
              backgroundColor: "#ccc",
              color: "#111",
              cursor: "pointer"
            }}
          >
            Cancel
          </button>
        </div>

        {showQR && <QRModal host={host} amount={amount} onClose={() => setShowQR(false)} />}
      </div>
    </div>
  );
}
