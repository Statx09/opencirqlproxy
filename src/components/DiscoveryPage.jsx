import React, { useMemo, useState } from "react";
import TopicSearchBar from "./TopicSearchBar";

export default function DiscoveryPage({
  hosts = [],
  user,
  onOpenProfile,
  onOpenMessage,
  onOpenCall,
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query) return hosts;

    const q = query.toLowerCase();

    return hosts.filter((h) => {
      const topics = Array.isArray(h.topics)
        ? h.topics
        : String(h.topics || "")
            .replace(/[{}"]/g, "")
            .split(",");

      const intents = Array.isArray(h.intent_tags)
        ? h.intent_tags
        : String(h.intent_tags || "")
            .replace(/[{}"]/g, "")
            .split(",");

      return (
        (h.name || h.alias || "").toLowerCase().includes(q) ||
        topics.join(" ").toLowerCase().includes(q) ||
        intents.join(" ").toLowerCase().includes(q)
      );
    });
  }, [hosts, query]);

  return (
    <div style={page}>
      <TopicSearchBar value={query} onChange={setQuery} />

      <div style={grid}>
        {filtered.map((host) => (
          <MiniHostCard
            key={host.user_id}
            host={host}
            onOpenProfile={onOpenProfile}
            onOpenMessage={onOpenMessage}
            onOpenCall={onOpenCall}
          />
        ))}
      </div>
    </div>
  );
}

/* ================= MINI CARD ================= */

function MiniHostCard({
  host,
  onOpenProfile,
  onOpenMessage,
  onOpenCall,
}) {
  const avatar = host.avatar_url || host.avatar;

  const topics = Array.isArray(host.topics)
    ? host.topics
    : String(host.topics || "")
        .replace(/[{}"]/g, "")
        .split(",");

  return (
    <div
      style={card}
      onClick={() => onOpenProfile?.(host)}
    >
      {/* BANNER */}
      <div
        style={{
          ...banner,
          backgroundImage: host.banner_url
            ? `url(${host.banner_url})`
            : "linear-gradient(135deg,#7c3aed,#3b82f6)",
        }}
      />

      {/* AVATAR */}
      <img src={avatar} style={avatarStyle} />

      {/* CONTENT */}
      <div style={content}>
        <div style={name}>
          {host.name || host.alias || "Unnamed"}
        </div>

        {/* TAGS */}
        <div style={tagWrap}>
          {topics.slice(0, 3).map((topic, i) => (
            <span key={i} style={tag}>
              {topic.trim()}
            </span>
          ))}
        </div>

        {/* MINI ACTION RAIL */}
        <div style={miniRail}>
          <button
            style={miniBtn}
            onClick={(e) => {
              e.stopPropagation();
              onOpenMessage?.(host);
            }}
          >
            💬
          </button>

          <button
            style={miniBtn}
            onClick={(e) => {
              e.stopPropagation();
              onOpenCall?.(host);
            }}
          >
            📞
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const page = {
  height: "100%",
  overflowY: "auto",
  padding: "70px 12px 110px",
  background: "#0b1220",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: 12,
};

const card = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 18,
  overflow: "hidden",
  cursor: "pointer",
  position: "relative",
};

const banner = {
  height: 110,
  backgroundSize: "cover",
  backgroundPosition: "center",
};

const avatarStyle = {
  width: 70,
  height: 70,
  borderRadius: "50%",
  border: "3px solid white",
  marginTop: -35,
  marginLeft: 12,
  objectFit: "cover",
};

const content = {
  padding: 12,
};

const name = {
  color: "#fff",
  fontWeight: 800,
  fontSize: 14,
  marginBottom: 8,
};

const tagWrap = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
};

const tag = {
  fontSize: 10,
  padding: "4px 8px",
  borderRadius: 999,
  background: "#ede9fe",
  color: "#5b21b6",
};

/* ================= MINI ACTION RAIL ================= */

const miniRail = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: 10,
  gap: 8,
};

const miniBtn = {
  flex: 1,
  padding: "6px 0",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(0,0,0,0.3)",
  color: "#fff",
  cursor: "pointer",
};