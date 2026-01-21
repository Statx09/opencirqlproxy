// src/LiveCastSection.jsx
import React from "react";
import HostCard from "./HostCard";

export default function LiveCastSection({ hosts, onJoin, onTip }) {
  if (!hosts || hosts.length === 0) {
    return <p style={{ textAlign: "center" }}>No livecasts at the moment.</p>;
  }

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 16
    }}>
      {hosts.map(host => (
        <HostCard key={host.id} host={host} onJoin={onJoin} onTip={onTip} />
      ))}
    </div>
  );
}
