import React from "react";

export default function HostCard({ host }) {
  return (
    <div
      className="host-card"
      style={{
        padding: "12px",
        border: "1px solid #ddd",
        borderRadius: "12px",
        textAlign: "center",
        width: "180px",
        margin: "8px"
      }}
    >
      <img
        src={host.avatar}
        alt={host.name}
        style={{
          width: "150px",
          height: "150px",
          objectFit: "cover",
          borderRadius: "12px",
          marginBottom: "8px"
        }}
      />
      <h3 style={{ margin: "4px 0" }}>{host.name}</h3>
      <p style={{ fontSize: "14px", color: "#555", margin: "4px 0" }}>
        {host.keywords}
      </p>
      {host.link && (
        <a
          href={host.link}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            marginTop: "8px",
            padding: "6px 12px",
            backgroundColor: "#4caf50",
            color: "#fff",
            borderRadius: "6px",
            textDecoration: "none",
            fontSize: "14px"
          }}
        >
          Call
        </a>
      )}
    </div>
  );
}
