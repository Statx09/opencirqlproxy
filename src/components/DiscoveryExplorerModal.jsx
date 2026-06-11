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
  const [index, setIndex] = useState(0);

  const filtered = hosts.filter((h) => {
    if (!query) return true;
    return (h.topics || []).join(" ").toLowerCase().includes(query.toLowerCase());
  });

  const current = filtered[index % Math.max(filtered.length, 1)];

  if (!filtered.length) {
    return (
      <div style={backdrop} onClick={onClose}>
        <div style={modal} onClick={(e) => e.stopPropagation()}>
          <h2>No results</h2>
          <TopicSearchBar value={query} onChange={setQuery} />
        </div>
      </div>
    );
  }

  return (
    <div style={backdrop} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>

        <div style={header}>
          <h2>🔍 Discovery</h2>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>

        <TopicSearchBar value={query} onChange={setQuery} />

        <div style={content}>
          <button onClick={() => setIndex(i => i - 1)} style={arrow}>‹</button>

          <HostCard
            host={current}
            user={user}
            hasProfile={!!user}
            onViewProfile={() => onOpenHost?.(current)}
          />

          <button onClick={() => setIndex(i => i + 1)} style={arrow}>›</button>
        </div>
      </div>
    </div>
  );
}

const backdrop = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", justifyContent: "center", alignItems: "center" };
const modal = { background: "#0b1220", width: "100%", height: "100vh", color: "#fff", padding: 16 };
const header = { display: "flex", justifyContent: "space-between" };
const closeBtn = { background: "transparent", color: "#fff", border: "none", fontSize: 24 };
const content = { display: "flex", alignItems: "center", justifyContent: "center", gap: 12 };
const arrow = { fontSize: 28, background: "rgba(255,255,255,0.1)", color: "#fff", border: "none", padding: 10 };