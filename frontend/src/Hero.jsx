// src/Hero.jsx
import React from "react";

export default function Hero() {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 10,
        background: "#fff",
        boxShadow: "0 6px 18px rgba(2,6,23,0.04)",
        marginBottom: 20,
      }}
    >
      <h1 style={{ margin: 0 }}>CirqlProxy</h1>
      <p style={{ margin: "6px 0 12px", color: "#666" }}>
        Find hosts, join live calls and tip creators.
      </p>
    </div>
  );
}
