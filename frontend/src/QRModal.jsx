// src/QRModal.jsx
import React from "react";

export default function QRModal({ host, amount, onClose }) {
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
      <div style={{ background: "#fff", padding: 24, borderRadius: 12, width: 280, textAlign: "center" }}>
        <h3>Scan QR to Tip {host.name}</h3>
        <div style={{ margin: "20px 0" }}>
          {/* Replace this with actual QR code component */}
          <div style={{
            width: 180,
            height: 180,
            margin: "0 auto",
            backgroundColor: "#eee",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 12
          }}>
            QR
          </div>
        </div>
        <p>Amount: {amount}</p>
        <button
          onClick={onClose}
          style={{
            padding: 10,
            borderRadius: 6,
            border: "none",
            backgroundColor: "#0EA5E9",
            color: "#fff",
            cursor: "pointer",
            width: "100%"
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

