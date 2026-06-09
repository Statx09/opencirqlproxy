import React, { useState } from "react";
import HostCard from "./HostCard";

export default function DiscoveryExplorerModal({
  hosts = [],
  user,
  onClose,
  onOpenHost,
}) {
  const [index, setIndex] = useState(0);

  if (!hosts.length) {
    return (
      <div style={backdrop}>
        <div style={modal}>
          <div style={header}>
            <h2 style={{ margin: 0 }}>🔍 Discovery Feed</h2>

            <button onClick={onClose} style={closeBtn}>
              ✕
            </button>
          </div>

          <div style={emptyState}>
            No recommendations available yet.
          </div>
        </div>
      </div>
    );
  }

  const currentItem = hosts[index];
  const currentHost = currentItem?.host || currentItem;

  const prev = (e) => {
    e.stopPropagation();
    setIndex((i) => (i - 1 + hosts.length) % hosts.length);
  };

  const next = (e) => {
    e.stopPropagation();
    setIndex((i) => (i + 1) % hosts.length);
  };

  return (
    <div style={backdrop}>
      <div style={modal}>
        {/* HEADER */}
        <div style={header}>
          <div>
            <h2 style={{ margin: 0 }}>🔍 Discovery Feed</h2>

            <div style={subText}>
              Browse recommended people one profile at a time
            </div>
          </div>

          <button onClick={onClose} style={closeBtn}>
            ✕
          </button>
        </div>

        {/* MAIN */}
        <div style={content}>
          <button onClick={prev} style={arrowBtn}>
            ‹
          </button>

          <div style={cardStage}>
            <div style={cardScale}>
              <HostCard
                host={currentHost}
                user={user}
                hasProfile={!!user}
               onViewProfile={() => onOpenHost?.(currentHost)}
              />
            </div>
          </div>

          <button onClick={next} style={arrowBtn}>
            ›
          </button>
        </div>

        {/* FOOTER */}
        <div style={footer}>
          {index + 1} / {hosts.length}
        </div>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const backdrop = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.88)",
  zIndex: 9000,
};

const modal = {
  width: "100%",
  height: "100vh",
  background: "#0b1220",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  padding: "16px",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
};

const subText = {
  fontSize: 12,
  opacity: 0.7,
  marginTop: 4,
};

const closeBtn = {
  background: "transparent",
  border: "none",
  color: "#fff",
  fontSize: 24,
  cursor: "pointer",
};

const content = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 20,
  padding: 20,
};

const cardStage = {
  flex: 1,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const cardScale = {
  transform: "scale(1.55)",
  transformOrigin: "center",
};

const arrowBtn = {
  width: 58,
  height: 58,
  borderRadius: 14,
  border: "none",
  background: "rgba(255,255,255,0.08)",
  color: "#fff",
  fontSize: 34,
  fontWeight: 700,
  cursor: "pointer",
  flexShrink: 0,
};

const footer = {
  textAlign: "center",
  padding: "14px",
  opacity: 0.7,
  borderTop: "1px solid rgba(255,255,255,0.08)",
};

const emptyState = {
  flex: 1,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  opacity: 0.7,
};