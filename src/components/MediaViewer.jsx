import React, { useEffect, useState, useRef } from "react";

export default function MediaViewer({ media, onClose }) {
  const [index, setIndex] = useState(0);
  const stripRef = useRef(null);

  useEffect(() => {
    setIndex(media?.index || 0);
  }, [media]);

  if (!media) return null;

  const items = Array.isArray(media.items)
    ? media.items.filter(Boolean)
    : [];

  if (!items.length) return null;

  const goNext = (e) => {
    e?.stopPropagation();
    setIndex((i) => (i + 1) % items.length);
  };

  const goPrev = (e) => {
    e?.stopPropagation();
    setIndex((i) => (i - 1 + items.length) % items.length);
  };

  // smooth scroll thumbnail into view
  useEffect(() => {
    const el = stripRef.current?.children?.[index];
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [index]);

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>

        {/* CLOSE */}
        <button style={closeBtn} onClick={onClose}>
          ✕
        </button>

        {/* MAIN VIEW */}
        <div style={main}>
          <img src={items[index]} style={img} />
        </div>

        {/* NAV */}
        {items.length > 1 && (
          <div style={nav}>
            <button onClick={goPrev} style={btn}>←</button>

            <div style={{ fontSize: 13, opacity: 0.8 }}>
              {index + 1} / {items.length}
            </div>

            <button onClick={goNext} style={btn}>→</button>
          </div>
        )}

        {/* SCROLLABLE FILMSTRIP (FIXED UX CORE) */}
        {items.length > 1 && (
          <div ref={stripRef} style={strip}>
            {items.map((src, i) => (
              <div
                key={i}
                onClick={() => setIndex(i)}
                style={{
                  ...thumbWrap,
                  border:
                    i === index
                      ? "2px solid #7c3aed"
                      : "2px solid transparent",
                }}
              >
                <img
                  src={src}
                  style={{
                    ...thumb,
                    opacity: i === index ? 1 : 0.5,
                    transform:
                      i === index ? "scale(1.05)" : "scale(1)",
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.92)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 99999,
};

const modal = {
  width: "95%",
  maxWidth: 950,
  background: "#0f172a",
  borderRadius: 18,
  padding: 14,
  color: "#fff",
  position: "relative",
};

const closeBtn = {
  position: "absolute",
  right: 14,
  top: 14,
  background: "rgba(0,0,0,0.8)",
  color: "#fff",
  border: "1px solid #333",
  borderRadius: 10,
  padding: "6px 10px",
  cursor: "pointer",
};

const main = {
  height: "65vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  overflow: "hidden",
};

const img = {
  maxWidth: "100%",
  maxHeight: "100%",
  objectFit: "contain",
  borderRadius: 12,
};

const nav = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: 10,
};

const btn = {
  background: "#7c3aed",
  border: "none",
  color: "#fff",
  padding: "6px 12px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 700,
};

const strip = {
  display: "flex",
  overflowX: "auto",
  gap: 8,
  marginTop: 14,
  paddingBottom: 6,
  scrollBehavior: "smooth",
};

const thumbWrap = {
  flexShrink: 0,
  borderRadius: 10,
  padding: 2,
  cursor: "pointer",
};

const thumb = {
  width: 72,
  height: 72,
  objectFit: "cover",
  borderRadius: 8,
  transition: "0.2s ease",
};