// src/RequestCard.jsx
import React from "react";

export default function RequestCard({ request }) {
  if (!request) return null;
  return (
    <div style={{ padding: 10, border: "1px solid #eee", borderRadius: 8 }}>
      <strong>{request.name}</strong>
      <div style={{ fontSize: 12 }}>{request.reason}</div>
    </div>
  );
}

