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

  <div style={studioButton}>
    <HeroCallCard
      onOpen={onOpenCallsStudio}
    />
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
  padding: "70px 18px 120px",
  background: "#0b1220",
  minHeight: "100vh",
};

const header = {
  position: "relative",
  paddingTop: 50,
  marginBottom: 24,
  minHeight: 110,
};

const studioButton = {
  position: "absolute",
  top: -50,
  right: 0,
  zIndex: 20,
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: 12,
};
