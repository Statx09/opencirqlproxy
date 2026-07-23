import React, { useMemo, useState } from "react";
import TopicSearchBar from "./TopicSearchBar";
import MiniHostCard from "./MiniHostCard";
import LiveStatusCard from "./live/LiveStatusCard";
import HeroCallCard from "./HeroCallCard";
import { normalizeHost } from "../utils/normalizeHost";

export default function DiscoveryPage({
  hosts = [],
  onAction,
  statuses = [],
  mode,
  onToggleMode,
  onOpenPulse,
  onOpenCallsStudio,
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
  const q = query.toLowerCase();

  const result = hosts
    .map(normalizeHost)
    .filter((h) => {
      const name = h.name?.toLowerCase() || "";
      const topics = (h.topics || []).join(" ").toLowerCase();
      const intents = (h.intents || []).join(" ").toLowerCase();

      return (
        name.includes(q) ||
        topics.includes(q) ||
        intents.includes(q)
      );
    });

  console.log(
    "FILTERED:",
    result.map(h => ({
      alias: h.alias,
      name: h.name
    }))
  );

  return result;

}, [hosts, query]);

  return (
  <div style={page}>

    <div style={header}>

  <div style={topRow}>

    <button
      style={topButton}
      onClick={onToggleMode}
    >
      {mode === "grid"
        ? "⇄ Swipe View"
        : "▦ Grid View"}
    </button>

    <button
      style={topButton}
      onClick={onOpenCallsStudio}
    >
      Call Studio
    </button>

  </div>

  <LiveStatusCard
    statuses={statuses}
    onOpen={onOpenPulse}
  />

  <TopicSearchBar
    value={query}
    onChange={setQuery}
  />

</div>

    {/* GRID */}
    <div style={grid}>
      {filtered.map((host) => (
        <MiniHostCard
          key={host.id}
          host={host}
          onAction={onAction}
        />
      ))}
    </div>

    </div>
);
}

/* ================= STYLES ================= */

const page = {
  padding: "20px 18px 120px",
  background: "#0b1220",
  minHeight: "100vh",
};

const header = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  marginBottom: 24,
};

const grid = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 12,
  maxWidth: 520,
  margin: "0 auto",
};

const studioRow = {
  display: "flex",
  justifyContent: "flex-end",
};

const topRow = {
  display: "flex",
  gap: 12,
  marginBottom: 14,
};

const topButton = {
  flex: 1,
  height: 46,

  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  borderRadius: 14,
  border: "1px solid rgba(255,255,255,.12)",

  background:
    "linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.05))",

  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",

  boxShadow: "0 8px 24px rgba(0,0,0,.30)",

  color: "#fff",
  fontWeight: 600,
  fontSize: 15,

  cursor: "pointer",
};


