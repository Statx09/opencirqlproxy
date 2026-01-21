// src/RequestCards.jsx
import React from "react";
import RequestCard from "./RequestCard";

export default function RequestCards({ requests = [] }) {
  if (!requests.length) return <p style={{ textAlign: "center" }}>No requests</p>;
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      {requests.map((r) => <RequestCard key={r.id} request={r} />)}
    </div>
  );
}
