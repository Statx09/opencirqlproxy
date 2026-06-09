import React, { useEffect, useState, useRef } from "react";

export default function ImageModal({
  images = [],
  initialIndex = 0,
  onClose,
}) {
  const [index, setIndex] = useState(initialIndex);
  const stripRef = useRef(null);

  // Sync when reopened
  useEffect(() => {
    setIndex(initialIndex);
  }, [initialIndex]);

  if (!images || images.length === 0) return null;

  // ---------------- NAV ----------------
  const goNext = () => {
    setIndex((prev) => {
      const next = (prev + 1) % images.length;
      scrollToThumb(next);
      return next;
    });
  };

  const goPrev = () => {
    setIndex((prev) => {
      const next = (prev - 1 + images.length) % images.length;
      scrollToThumb(next);
      return next;
    });
  };

  // ---------------- SCROLL FIX (IMPORTANT) ----------------
  const scrollToThumb = (i) => {
    const el = stripRef.current?.querySelectorAll("img")?.[i];

    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  };

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>

        {/* CLOSE */}
        <button onClick={onClose} style={closeBtn}>
          ✕
        </button>

        {/* MAIN IMAGE */}
        <div style={mainContainer}>
          <img src={images[index]} alt="" style={mainImage} />
        </div>

        {/* NAV */}
        <div style={navRow}>
          <button onClick={goPrev} style={navBtn}>←</button>

          <div style={counter}>
            {index + 1} / {images.length}
          </div>

          <button onClick={goNext} style={navBtn}>→</button>
        </div>

        {/* SCROLLABLE THUMBS */}
        <div style={thumbStrip} ref={stripRef}>
          {images.map((img, i) => (
            <img
              key={i}
              src={img}
              onClick={() => setIndex(i)}
              style={{
                ...thumb,
                border:
                  i === index
                    ? "2px solid #7c3aed"
                    : "2px solid transparent",
                opacity: i === index ? 1 : 0.6,
              }}
              alt=""
            />
          ))}
        </div>

      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.9)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 99999,
};

const modal = {
  width: "95%",
  maxWidth: 900,
  background: "#0f172a",
  borderRadius: 16,
  padding: 12,
  display: "flex",
  flexDirection: "column",
  gap: 10,
  position: "relative",
  color: "#fff",
};

const closeBtn = {
  position: "absolute",
  right: 10,
  top: 10,
  background: "#000",
  border: "none",
  color: "#fff",
  padding: "6px 10px",
  borderRadius: 8,
  cursor: "pointer",
};

const mainContainer = {
  width: "100%",
  height: "60vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#000",
  borderRadius: 12,
  overflow: "hidden",
};

const mainImage = {
  maxWidth: "100%",
  maxHeight: "100%",
  objectFit: "contain",
};

const navRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const navBtn = {
  background: "#7c3aed",
  border: "none",
  color: "#fff",
  padding: "8px 14px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 700,
};

const counter = {
  fontSize: 13,
  color: "#aaa",
};

/* 🔥 FIXED SCROLL BEHAVIOR */
const thumbStrip = {
  display: "flex",
  gap: 8,
  overflowX: "auto",
  WebkitOverflowScrolling: "touch", // important for smooth mobile scroll
  scrollBehavior: "smooth",
  padding: "6px 0",
};

const thumb = {
  width: 70,
  height: 70,
  borderRadius: 10,
  objectFit: "cover",
  cursor: "pointer",
  flexShrink: 0,
};