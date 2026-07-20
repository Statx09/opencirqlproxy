import React, { useEffect, useState } from "react";

export default function StatusTicker({ statuses = [], onOpen }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!statuses.length) return;

    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % statuses.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [statuses]);

  if (!statuses.length) {
    return (
      <div style={wrap}>
        <p style={text}>No live statuses yet...</p>
      </div>
    );
  }

  const s = statuses[index];

  return (
    <div style={wrap} onClick={onOpen}>
      <div style={bubble}>
        💬 {s.content}
      </div>

      <div style={meta}>
        @{s.user_id?.slice(0, 6)} • live
      </div>
    </div>
  );
}

const wrap = {
  padding: "10px 14px",
  borderRadius: 12,
  background: "rgba(255,255,255,0.06)",
  backdropFilter: "blur(10px)",
  cursor: "pointer",
  transition: "all 0.3s ease",
};

const text = {
  color: "#aaa",
  fontSize: 13,
};

const bubble = {
  color: "#fff",
  fontSize: 14,
  marginBottom: 4,
};

const meta = {
  fontSize: 11,
  color: "#888",
};