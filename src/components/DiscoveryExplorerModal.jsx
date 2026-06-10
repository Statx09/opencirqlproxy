import React, { useState, useCallback } from "react";
import HostCard from "./HostCard";

export default function DiscoveryExplorerModal({
  hosts = [],
  user,
  onClose,
  onOpenHost,
}) {
  const [index, setIndex] = useState(0);

  const prev = useCallback(
    (e) => {
      e.stopPropagation();
      setIndex((i) => (i - 1 + hosts.length) % hosts.length);
    },
    [hosts.length]
  );

  const next = useCallback(
    (e) => {
      e.stopPropagation();
      setIndex((i) => (i + 1) % hosts.length);
    },
    [hosts.length]
  );

  const currentItem = hosts[index];
  const currentHost = currentItem?.host || currentItem;

  if (!hosts.length) {
    return (
      <div style={backdrop}>
        <div style={modal}>
          <div style={header}>
            <div>
              <h2 style={{ margin: 0 }}>🔍 Discovery Feed</h2>
            </div>

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

  return (
    <div style={backdrop} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
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

        {/* MAIN CONTENT */}
        <div style={content}>
          <button onClick={prev} style={arrowBtn}>
            ‹
          </button>

          <div style={cardStage}>
            <HostCard
              host={currentHost}
              user={user}
              hasProfile={!!user}
              onViewProfile={onOpenHost}
            />
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
  background: "rgba(0,0,0,0.85)",
  zIndex: 9000,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modal = {
  width: "100%",
  height: "100vh",
  background: "#0b1220",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
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
  flexDirection: window.innerWidth < 768 ? "column" : "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  padding: 12,
};

const cardStage = {
  flex: 1,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const arrowBtn = {
  width: 60,
  height: 60,
  borderRadius: 12,
  border: "none",
  background: "rgba(255,255,255,0.08)",
  color: "#fff",
  fontSize: 28,
  fontWeight: 700,
  cursor: "pointer",
  flexShrink: 0,
};

const footer = {
  textAlign: "center",
  padding: "12px",
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