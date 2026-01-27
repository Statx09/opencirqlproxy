// src/HostCards.jsx
import React from "react";
import HostCard from "./HostCard";

export default function HostCards({ hosts, onJoin, onTip, onViewProfile }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
        gap: 16,
      }}
    >
      {hosts.map((host) => (
        <HostCard
          key={host.id}
          host={host}
          onJoin={() => onJoin(host)}
          onTip={() => onTip(host)}
          onViewProfile={() => onViewProfile(host)}
        />
      ))}
    </div>
  );
}
