import React, { useState } from "react";
import HostCard from "./HostCard";
import TopicSearchBar from "./TopicSearchBar";

export default function DiscoveryExplorerModal({
  hosts = [],
  user,
  onClose,
  onOpenHost,
}) {
  const [query, setQuery] = useState("");

  const filtered = hosts.filter((h) => {
    if (!query) return true;

    return (h.topics || [])
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase());
  });

  return (
    <div style={backdrop}>

      <div style={modal} onClick={(e) => e.stopPropagation()}>

        {/* HEADER */}
        <div style={header}>
          <h2>🔍 Discovery</h2>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>

        {/* SEARCH */}
        <TopicSearchBar value={query} onChange={setQuery} />

        {/* GRID */}
        <div style={grid}>
          {filtered.map((host) => (
            <div
              key={host.user_id}
              onClick={() => onOpenHost?.(host)}
              style={{ cursor: "pointer" }}
            >
              <HostCard
                host={host}
                user={user}
                hasProfile={!!user}
                onViewProfile={() => onOpenHost?.(host)}
              />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

/* styles */
const backdrop = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.85)",
  overflowY: "auto",
  zIndex: 999,
};

const modal = {
  minHeight: "100vh",
  background: "#0b1220",
  color: "#fff",
  padding: 16,
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const closeBtn = {
  background: "transparent",
  color: "#fff",
  border: "none",
  fontSize: 24,
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: 10,
  marginTop: 12,
};
