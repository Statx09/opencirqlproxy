import React, { useEffect, useState } from "react";
import HostCard from "./HostCard";
import LiveStatusCard from "./live/LiveStatusCard";

export default function Hero({
  suggestedMatch,
  onOpenHost,
  user,
  onOpenExplorer,
  onOpenStatus,
  supabase,
}) {

  const [deck, setDeck] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!suggestedMatch) return;

    setDeck((prev) => {
      const exists = prev.find(
        (x) => x.host?.user_id === suggestedMatch?.host?.user_id
      );
      if (exists) return prev;

      return [suggestedMatch, ...prev].slice(0, 10);
    });
  }, [suggestedMatch]);

  const current = deck.length ? deck[index % deck.length]?.host : null;

  const next = () => setIndex((i) => (i + 1) % deck.length);
  const prev = () => setIndex((i) => (i - 1 + deck.length) % deck.length);


  return (
    <div style={heroWrap}>
      
      {/* LIVE */}
<LiveStatusCard
  onOpen={onOpenStatus}
/>

      {/* RIGHT — HOST CARD */}
      <div style={right}>
        <button onClick={prev} style={arrow}>‹</button>

        {current && (
          <HostCard
            host={current}
            user={user}
            onViewProfile={() => onOpenHost(current)}
          />
        )}

        <button onClick={next} style={arrow}>›</button>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const heroWrap = {
  display: "flex",
  justifyContent: "space-between",
  padding: "12px 18px",
  background: "linear-gradient(180deg,#0b1220,#0a0f1a)",
  color: "white",
  gap: 16,
};

const left = { flex: 1 };

const label = {
  fontSize: 11,
  opacity: 0.6,
  marginBottom: 6,
};

const ticker = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  cursor: "pointer",
};

const pill = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  padding: "8px",
  borderRadius: 12,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.06)",
};

const avatar = {
  width: 28,
  height: 28,
  borderRadius: "50%",
  objectFit: "cover",
};

const textBlock = {
  display: "flex",
  flexDirection: "column",
};

const name = {
  fontSize: 12,
  fontWeight: 600,
};

const msg = {
  fontSize: 11,
  opacity: 0.7,
};

const right = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const arrow = {
  width: 32,
  height: 32,
  borderRadius: 8,
  border: "none",
  background: "rgba(255,255,255,0.06)",
  color: "white",
  cursor: "pointer",
};