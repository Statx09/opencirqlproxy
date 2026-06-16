import React, { useMemo, useState, useCallback } from "react";
import TopicSearchBar from "./TopicSearchBar";

/* ================= MAIN MODAL ================= */

export default function DiscoveryExplorerModal({
  hosts = [],
  user,
  onClose,
  onOpenHost,
}) {
  const [query, setQuery] = useState("");

  // CACHE FILTERING (prevents recalculation every keystroke render cycle)
  const filtered = useMemo(() => {
    if (!query) return hosts;

    const q = query.toLowerCase();

    return hosts.filter((h) => {
      const topics = Array.isArray(h.topics)
        ? h.topics
        : String(h.topics || "")
            .replace(/[{}"]/g, "")
            .split(",");

      return topics.join(" ").toLowerCase().includes(q);
    });
  }, [hosts, query]);

  return (
    <div style={backdrop}>
      <div style={container} onClick={(e) => e.stopPropagation()}>

        {/* HEADER */}
        <div style={header}>
          <div style={title}>🔍 Discover</div>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>

        {/* SEARCH */}
        <div style={searchWrap}>
          <TopicSearchBar value={query} onChange={setQuery} />
        </div>

        {/* GRID */}
        <div style={grid}>
          {filtered.map((host) => (
            <MiniHostCardMemo
              key={host.user_id}
              host={host}
              user={user}
              onClick={() => onOpenHost?.(host)}
            />
          ))}
        </div>

      </div>
    </div>
  );
}

/* ================= MEMOIZED CARD ================= */

const MiniHostCard = React.memo(function MiniHostCard({
  host,
  onClick,
  user,
}) {
  const name = host.name || host.alias || "Unnamed";
  const avatar = host.avatar_url || host.avatar;
  const banner = host.banner_url;

  // NORMALIZATION DONE ONCE PER RENDER (still ok, but stable now)
  const topics = useMemo(() => {
    const raw = host.topics;
    if (!raw) return [];

    const arr = Array.isArray(raw)
      ? raw
      : String(raw).replace(/[{}"]/g, "").split(",");

    return arr.map((v) => v.trim()).filter(Boolean).slice(0, 3);
  }, [host.topics]);

  const intents = useMemo(() => {
    const raw = host.intent_tags;
    if (!raw) return [];

    const arr = Array.isArray(raw)
      ? raw
      : String(raw).replace(/[{}"]/g, "").split(",");

    return arr.map((v) => v.trim()).filter(Boolean).slice(0, 2);
  }, [host.intent_tags]);

  // OPTIMISTIC WAVE (no blocking alert)
  const handleWave = useCallback(
    async (e) => {
      e.stopPropagation();

      if (!user?.id) return;

      // optimistic UI feedback
      try {
        await fetch("/api/wave", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            from_user: user.id,
            to_user: host.user_id,
          }),
        });
      } catch (err) {
        console.error("Wave failed", err);
      }
    },
    [user?.id, host.user_id]
  );

  return (
    <div style={card} onClick={onClick}>

      {/* BANNER */}
      <div
        style={{
          ...bannerStyle,
          backgroundImage: banner
            ? `url(${banner})`
            : "linear-gradient(135deg,#7c3aed,#3b82f6)",
        }}
      />

      {/* WAVE */}
      <button style={waveBtn} onClick={handleWave}>
        👋
      </button>

      {/* AVATAR */}
      <img
        src={avatar}
        style={avatarStyle}
        loading="lazy"
        decoding="async"
      />

      {/* CONTENT */}
      <div style={content}>
        <div style={nameStyle}>{name}</div>

        {/* INTENTS */}
        <div style={tagRow}>
          {intents.map((t, i) => (
            <span key={i} style={intentTag}>{t}</span>
          ))}
        </div>

        {/* TOPICS */}
        <div style={tagRow}>
          {topics.map((t, i) => (
            <span key={i} style={topicTag}>{t}</span>
          ))}
        </div>
      </div>

    </div>
  );
});

/* export alias for readability */
const MiniHostCardMemo = MiniHostCard;

/* ================= STYLES ================= */

const backdrop = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.88)",
  zIndex: 999,
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  overflowY: "auto",
};

const container = {
  width: "100%",
  maxWidth: 900,
  minHeight: "100vh",
  background: "#0b1220",
  color: "#fff",
  padding: 16,
  boxSizing: "border-box",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 12,
};

const title = {
  fontSize: 18,
  fontWeight: 900,
};

const closeBtn = {
  background: "transparent",
  color: "#fff",
  border: "none",
  fontSize: 24,
  cursor: "pointer",
};

const searchWrap = {
  marginBottom: 12,
};

/* GRID */
const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: 12,
};

/* CARD */
const card = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 18,
  overflow: "hidden",
  cursor: "pointer",
  position: "relative",
  minHeight: 260,
};

/* BANNER */
const bannerStyle = {
  height: 140,
  width: "100%",
  backgroundSize: "cover",
  backgroundPosition: "center",
};

/* AVATAR */
const avatarStyle = {
  width: 70,
  height: 70,
  borderRadius: "50%",
  border: "3px solid white",
  position: "absolute",
  top: 95,
  left: 10,
  objectFit: "cover",
};

/* WAVE */
const waveBtn = {
  position: "absolute",
  top: 10,
  right: 10,
  width: 36,
  height: 36,
  borderRadius: "50%",
  background: "#111",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.2)",
  fontSize: 14,
  zIndex: 5,
};

/* CONTENT */
const content = {
  padding: "34px 10px 10px 10px",
};

const nameStyle = {
  fontSize: 14,
  fontWeight: 900,
  marginBottom: 6,
};

const tagRow = {
  display: "flex",
  gap: 6,
  flexWrap: "wrap",
  marginTop: 6,
};

const intentTag = {
  background: "#d1fae5",
  color: "#065f46",
  padding: "3px 6px",
  borderRadius: 6,
  fontSize: 10,
};

const topicTag = {
  background: "#ede9fe",
  color: "#5b21b6",
  padding: "3px 6px",
  borderRadius: 6,
  fontSize: 10,
};
