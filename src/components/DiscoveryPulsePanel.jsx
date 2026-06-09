import React, { useEffect, useState } from "react";
import { fetchHosts } from "../api/fetchHosts";

export default function DiscoveryPulsePanel({ user, onSelectHost }) {
  const [hosts, setHosts] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const data = await fetchHosts();
      const list = Array.isArray(data) ? data : [];

      setHosts(list);
      setLoading(false);
    }

    load();
  }, []);

  const next = () => {
    setIndex((prev) => (prev + 1) % hosts.length);
  };

  const random = () => {
    const rand = Math.floor(Math.random() * hosts.length);
    setIndex(rand);
  };

  const current = hosts[index];

  const handleWave = async () => {
    if (!user?.id || !current?.user_id) return;

    try {
      await fetch("/api/wave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from_user: user.id,
          to_user: current.user_id,
        }),
      });

      alert("👋 Wave sent!");
    } catch (err) {
      console.error(err);
      alert("Failed to wave");
    }
  };

  const handleMessage = () => {
    if (onSelectHost && current) {
      onSelectHost(current);
    }
  };

  if (!user) {
    return (
      <div style={wrap}>
        <p style={{ color: "#94a3b8" }}>
          Login to discover people
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={wrap}>
        <p style={{ color: "#94a3b8" }}>Loading pulse...</p>
      </div>
    );
  }

  if (!current) {
    return (
      <div style={wrap}>
        <p>No suggestions available</p>
      </div>
    );
  }

  return (
    <div style={wrap}>
      <div style={header}>
        <h3 style={{ margin: 0 }}>Discovery Pulse</h3>
        <span style={liveDot}>● live</span>
      </div>

      {/* CARD */}
      <div style={card}>
        <img
          src={
            current.avatar_url ||
            "https://placehold.co/100x100"
          }
          style={avatar}
        />

        <div style={{ flex: 1 }}>
          <div style={name}>
            {current.alias || current.name || "Anonymous"}
          </div>

          <div style={meta}>
            {Array.isArray(current.topics)
              ? current.topics.slice(0, 2).join(" • ")
              : "Open to connect"}
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div style={actions}>
        <button onClick={handleWave} style={btnSoft}>
          👋 Wave
        </button>

        <button onClick={handleMessage} style={btnPrimary}>
          💬 Message
        </button>

        <button onClick={next} style={btn}>
          Next
        </button>

        <button onClick={random} style={btn}>
          🎲 Surprise
        </button>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const wrap = {
  padding: 14,
  borderRadius: 16,
  background: "#0f172a",
  color: "#fff",
  width: "100%",
  maxWidth: 320,
  boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 10,
};

const liveDot = {
  fontSize: 10,
  color: "#22c55e",
  fontWeight: 700,
};

const card = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  padding: 10,
  borderRadius: 12,
  background: "#111827",
  marginBottom: 10,
};

const avatar = {
  width: 42,
  height: 42,
  borderRadius: "50%",
  objectFit: "cover",
};

const name = {
  fontWeight: 700,
  fontSize: 14,
};

const meta = {
  fontSize: 12,
  color: "#94a3b8",
  marginTop: 2,
};

const actions = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 8,
};

const btn = {
  padding: "8px",
  borderRadius: 10,
  border: "none",
  background: "#1f2937",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
};

const btnPrimary = {
  padding: "8px",
  borderRadius: 10,
  border: "none",
  background: "#7c3aed",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};

const btnSoft = {
  padding: "8px",
  borderRadius: 10,
  border: "none",
  background: "#0ea5e9",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};