import React, { useMemo, useState } from "react";
import TopicSearchBar from "./TopicSearchBar";
import MiniHostCard from "./MiniHostCard";
import HeroCallCard from "./HeroCallCard";
import { normalizeHost } from "../utils/normalizeHost";
import { useTheme } from "../context/ThemeContext";

export default function DiscoveryPage({
  hosts = [],
  onAction,
  statuses = [],
  mode,
  onToggleMode,
  onOpenPulse,
  onOpenCallsStudio,
}) {

  const { theme } = useTheme();

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
  <div style={page(theme)}>

    <div style={header}>

  <div style={topRow}>

    <button
  style={topButton(theme)}
  onClick={onToggleMode}
>
      {mode === "grid"
        ? "⇄ Swipe View"
        : "▦ Grid View"}
    </button>

    <button
  style={topButton(theme)}
  onClick={onOpenCallsStudio}
>
      Call Studio
    </button>

  </div>

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

const page = (theme) => ({
  padding: "90px 18px 120px",
  background: theme.background,
  color: theme.text,
  minHeight: "100vh",
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
  transition: "all .25s ease",
});

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

const topButton = (theme) => ({
  flex: 1,
  height: 46,

  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  borderRadius: 14,

  background: theme.card,
  color: theme.text,

  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",

  border: `1px solid ${theme.border}`,

  boxShadow:
    "0 0 0 1px rgba(96,165,250,.18), 0 0 18px rgba(59,130,246,.20), 0 8px 22px rgba(0,0,0,.20)",

  fontWeight: 600,
  fontSize: 15,

  cursor: "pointer",
});
