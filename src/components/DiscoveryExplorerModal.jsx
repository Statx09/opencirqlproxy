import React, { useMemo, useState } from "react";
import HostCard from "./HostCard";

export default function DiscoveryExplorerModal({
  hosts = [],
  user,
  onClose,
  onOpenHost,
}) {
  const [search, setSearch] = useState("");

  const filteredHosts = useMemo(() => {
    if (!search.trim()) return hosts;

    const q = search.toLowerCase();

    return hosts.filter((item) => {
      const host = item?.host || item;

      const topics = Array.isArray(host?.topics)
        ? host.topics
        : [];

      const intents = Array.isArray(host?.intent_tags)
        ? host.intent_tags
        : [];

      const alias = host?.alias || "";
      const name = host?.name || "";

      return (
        alias.toLowerCase().includes(q) ||
        name.toLowerCase().includes(q) ||
        topics.some((t) =>
          String(t).toLowerCase().includes(q)
        ) ||
        intents.some((t) =>
          String(t).toLowerCase().includes(q)
        )
      );
    });
  }, [hosts, search]);

  return (
    <div style={backdrop} onClick={onClose}>
      <div
        style={modal}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div style={header}>
          <div>
            <h2 style={{ margin: 0 }}>
              🔍 Discover People
            </h2>

            <div style={subText}>
              Search by topic, intent or name
            </div>
          </div>

          <button
            onClick={onClose}
            style={closeBtn}
          >
            ✕
          </button>
        </div>

        {/* SEARCH */}
        <div style={searchWrap}>
          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search gaming, crypto, fitness..."
            style={searchInput}
          />
        </div>

        {/* RESULTS */}
        <div style={resultsArea}>
          {filteredHosts.length === 0 ? (
            <div style={emptyState}>
              No matching profiles found.
            </div>
          ) : (
            filteredHosts.map((item, i) => {
              const host =
                item?.host || item;

              return (
                <div
                  key={
                    host?.user_id ||
                    host?.id ||
                    i
                  }
                  style={cardWrap}
                >
                  <HostCard
                    host={host}
                    user={user}
                    hasProfile={!!user}
                    onViewProfile={() =>
                      onOpenHost?.(host)
                    }
                  />
                </div>
              );
            })
          )}
        </div>

        {/* FOOTER */}
        <div style={footer}>
          {filteredHosts.length} profiles
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
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  padding: "16px",
  borderBottom:
    "1px solid rgba(255,255,255,0.08)",
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

const searchWrap = {
  padding: 12,
  borderBottom:
    "1px solid rgba(255,255,255,0.08)",
};

const searchInput = {
  width: "100%",
  padding: 12,
  borderRadius: 12,
  border: "none",
  outline: "none",
  fontSize: 15,
};

const resultsArea = {
  flex: 1,
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: 16,
  padding: 16,
};

const cardWrap = {
  display: "flex",
  justifyContent: "center",
};

const footer = {
  textAlign: "center",
  padding: 12,
  opacity: 0.7,
  borderTop:
    "1px solid rgba(255,255,255,0.08)",
};

const emptyState = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
  minHeight: 200,
  opacity: 0.7,
};