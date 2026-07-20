import React, { useEffect, useMemo, useState } from "react";

export default function HeroPulse({
  statuses = [],
  onOpenPulse,
}) {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  const feed = useMemo(() => {
    return (statuses || [])
      .filter((s) => s?.id)
      .slice(0, 20);
  }, [statuses]);

  const visible = feed.slice(index, index + 3);

  // auto rotate (smooth + stable)
  useEffect(() => {
    if (!feed.length) return;

    const interval = setInterval(() => {
      setFade(false);

      setTimeout(() => {
        setIndex((i) => (i + 1) % feed.length);
        setFade(true);
      }, 180);
    }, 2400);

    return () => clearInterval(interval);
  }, [feed.length]);

  return (
    <div
      onClick={onOpenPulse}
      style={{
        ...wrap,
        opacity: fade ? 1 : 0.65,
        transform: fade ? "translateY(0px)" : "translateY(2px)",
      }}
    >
      {feed.length === 0 ? (
        <div style={empty}>
          No live expressions yet
        </div>
      ) : (
        visible.map((s, i) => (
          <div key={s.id || i} style={item}>

            {/* AVATAR (ALWAYS REAL OR FALLBACK IMAGE) */}
            <img
              src={
                s.avatar_url ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${s.name || "user"}`
              }
              style={avatar}
            />

            {/* TEXT */}
            <div style={{ minWidth: 0 }}>

              {/* NAME (NO FAKE FALLBACK) */}
              <div style={name}>
                {s.name}
              </div>

              {/* CONTENT (NO FAKE TEXT) */}
              <div style={text}>
                {s.content}
              </div>

            </div>
          </div>
        ))
      )}
    </div>
  );
}

/* ================= STYLES ================= */

const wrap = {
  display: "flex",
  gap: 12,
  padding: "10px 12px",
  borderRadius: 14,

  background: "rgba(0,0,0,0.38)",
  border: "1px solid rgba(255,255,255,0.08)",

  color: "white",
  cursor: "pointer",
  backdropFilter: "blur(14px)",

  transition: "all 0.25s ease",
};

const item = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  minWidth: 180,
};

const avatar = {
  width: 34,
  height: 34,
  borderRadius: "50%",
  objectFit: "cover",
  border: "1px solid rgba(255,255,255,0.2)",
};

const name = {
  fontSize: 12,
  fontWeight: 600,
  color: "#fff",
};

const text = {
  fontSize: 11,
  opacity: 0.8,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const empty = {
  fontSize: 12,
  opacity: 0.6,
  color: "#fff",
};