import React, { useEffect, useState } from "react";
import HostCard from "./HostCard";

export default function Hero({
  suggestedMatch,
  onOpenHost,
  user,
  onOpenExplorer,
}) {
  const [deck, setDeck] = useState([]);
  const [index, setIndex] = useState(0);

  // build deck (unchanged logic)
  useEffect(() => {
    if (!suggestedMatch) return;

    setDeck((prev) => {
      const exists = prev.find(
        (x) => x.host?.user_id === suggestedMatch?.host?.user_id
      );
      if (exists) return prev;

      return [suggestedMatch, ...prev].slice(0, 12);
    });
  }, [suggestedMatch]);

  const safeIndex = deck.length ? index % deck.length : 0;
  const current = deck[safeIndex]?.host;

  const goLeft = (e) => {
    e.stopPropagation();
    if (!deck.length) return;
    setIndex((i) => (i - 1 + deck.length) % deck.length);
  };

  const goRight = (e) => {
    e.stopPropagation();
    if (!deck.length) return;
    setIndex((i) => (i + 1) % deck.length);
  };

  if (!current) {
    return (
      <div style={heroStyle}>
        Finding live people...
      </div>
    );
  }

  return (
    <div style={heroStyle}>
      {/* LEFT TEXT */}
      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: 32, margin: 0 }}>CirqlProxy</h1>
        <p style={{ opacity: 0.7, marginTop: 4, fontSize: 13 }}>
          Live people. Real connections. No feeds.
        </p>
      </div>

      {/* RIGHT CARD AREA */}
      <div style={rightSide}>
        <button onClick={goLeft} style={arrowBtn}>
          ‹
        </button>

        {/* CARD WRAP (IMPORTANT FIXED POSITION CONTEXT) */}
        <div style={cardWrap}>
          <HostCard
            host={current}
            user={user}
            hasProfile={!!user}
            onViewProfile={() => onOpenHost?.(current)}
          />

          {/* 🔥 DISCOVER BUTTON (FIXED + ALWAYS VISIBLE) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenExplorer?.();
            }}
            style={discoverBtn}
          >
            🔍 Discover
          </button>
        </div>

        <button onClick={goRight} style={arrowBtn}>
          ›
        </button>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const heroStyle = {
  padding: "10px 18px",
  background: "linear-gradient(180deg, #111827, #0b1220)",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 18,
};

const rightSide = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

/* 🔥 IMPORTANT: must be relative for overlay button */
const cardWrap = {
  position: "relative",
};

const arrowBtn = {
  background: "rgba(255,255,255,0.08)",
  border: "none",
  color: "#fff",
  fontSize: 20,
  width: 34,
  height: 34,
  borderRadius: 10,
  cursor: "pointer",
};

const discoverBtn = {
  position: "absolute",
  top: 8,
  left: 8,
  padding: "5px 9px",
  borderRadius: 10,
  border: "none",
  background: "rgba(124, 58, 237, 0.95)",
  color: "#fff",
  fontWeight: 700,
  fontSize: 10,
  cursor: "pointer",
  zIndex: 50,
  boxShadow: "0 6px 16px rgba(124,58,237,0.25)",
};