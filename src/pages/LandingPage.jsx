import { useState } from "react";
import Hero from "../components/Hero";
import { useUser } from "../hooks/useUser";

export default function LandingPage() {
  const { user, login, logout } = useUser();

  const [activeTab, setActiveTab] = useState("Directory");

  if (user === undefined) {
    return <p style={{ padding: 20 }}>Loading...</p>;
  }

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: 16,
        fontFamily: "Arial",
      }}
    >
      <Hero />

      {/* Top Bar */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        {["Directory", "Requests", "Profile"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              background:
                activeTab === tab ? "#22c55e" : "#e5e7eb",
              color:
                activeTab === tab ? "white" : "#111827",
              fontWeight: 600,
            }}
          >
            {tab}
          </button>
        ))}

        <div style={{ marginLeft: "auto" }}>
          {user ? (
            <button
              onClick={logout}
              style={{
                padding: "10px 16px",
                borderRadius: 10,
                border: "none",
                background: "#ef4444",
                color: "white",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          ) : (
            <button
              onClick={login}
              style={{
                padding: "10px 16px",
                borderRadius: 10,
                border: "none",
                background: "#3b82f6",
                color: "white",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Login With Google
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 20,
          minHeight: 400,
        }}
      >
        {activeTab === "Directory" && (
          <h2>Host Directory Coming Next</h2>
        )}

        {activeTab === "Requests" && (
          <h2>Chat Requests Coming Next</h2>
        )}

        {activeTab === "Profile" && (
          <h2>Profile System Coming Next</h2>
        )}
      </div>
    </div>
  );
}
