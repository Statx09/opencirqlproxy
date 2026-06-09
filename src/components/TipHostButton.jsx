import React from "react";

export default function TipHostButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 12px",
        borderRadius: 8,
        border: "none",
        background: "#3b82f6",
        color: "#fff",
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      Tip
    </button>
  );
}
