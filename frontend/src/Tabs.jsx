import React from "react";

export default function Tabs({ activeTab, setActiveTab }) {
  const tabs = ["Hosts", "Livecasts", "Onboarding", "Dashboard"];

  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
            backgroundColor: activeTab === tab ? "#22c55e" : "#ddd",
            color: activeTab === tab ? "#fff" : "#111",
          }}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
