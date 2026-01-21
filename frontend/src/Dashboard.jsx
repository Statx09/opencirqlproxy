import React, { useState } from "react";

export default function Dashboard({ user }) {
  const [islive, setIsLive] = useState(user?.islive || false);

  const toggleLive = () => setIsLive(!islive);

  return (
    <div style={{ padding: 16 }}>
      <h2>Welcome, {user?.name || "User"}!</h2>

      {/* Floating online/offline toggle */}
      <button
        onClick={toggleLive}
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          padding: "10px 16px",
          borderRadius: 20,
          border: "none",
          backgroundColor: islive ? "#22c55e" : "#6b7280",
          color: "#fff",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        {islive ? "Online" : "Offline"}
      </button>

      <div style={{ marginTop: 24 }}>
        <h3>Profile Info</h3>
        <p>Email: {user?.email}</p>
        <p>Topics: {user?.topics}</p>
        <p>Wallet ID: {user?.WalletId || "Not set"}</p>
      </div>

      <div style={{ marginTop: 24 }}>
        <h3>Recent Activity</h3>
        <p>Calls made, tips received, referrals will appear here.</p>
      </div>
    </div>
  );
}

