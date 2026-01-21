// src/TipHostButton.jsx
import React from "react";

export default function TipHostButton({ onClick }) {
  return (
    <button onClick={onClick} style={{ backgroundColor: "#007bff", color: "#fff", borderRadius: 6, padding: "6px 10px" }}>
      Tip
    </button>
  );
}
