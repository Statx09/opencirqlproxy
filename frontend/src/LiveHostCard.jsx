import React from "react";

export default function LiveHostCard({ host, onJoin, onTip }) {
  return (
    <div
      style={{
        background: "#fff",
        padding: 15,
        borderRadius: 12,
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        textAlign: "center",
      }}
    >
      <img
        src={host.avatar || "/default-avatar.png"}
        alt="avatar"
        style={{ width: "100%", height: 160, borderRadius: 10, objectFit: "cover" }}
      />
      <h3 style={{ marginTop: 10 }}>{host.name}</h3>
      <p style={{ fontSize: 14, color: "#555" }}>{host.topics || "No topics listed"}</p>
      <button
        onClick={() => onJoin(host)}
        style={{
          width: "100%",
          marginTop: 10,
          padding: 10,
          background: "#0EA5E9",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        Join Live
      </button>
      <button
        onClick={() => onTip(host)}
        style={{
          width: "100%",
          marginTop: 8,
          padding: 10,
          background: "#F59E0B",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        Tip
      </button>
    </div>
  );
}
