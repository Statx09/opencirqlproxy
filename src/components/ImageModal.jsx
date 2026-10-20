import React, { useEffect, useState, useRef } from "react";

export default function ImageModal({ images = [], initialIndex = 0, onClose }) {
  const [index, setIndex] = useState(initialIndex);
  const touchStartX = useRef(null);

  useEffect(() => {
    setIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [images.length, onClose]);

  if (!images.length) return null;

  const goNext = () => setIndex((i) => (i + 1) % images.length);
  const goPrev = () => setIndex((i) => (i - 1 + images.length) % images.length);

  return (
    <div style={overlay} onClick={onClose}>
      <button
        type="button"
        aria-label="Close gallery"
        onClick={onClose}
        style={closeBtn}
      >
        ×
      </button>

      <button
        type="button"
        aria-label="Previous picture"
        onClick={(e) => { e.stopPropagation(); goPrev(); }}
        style={{ ...navBtn, left: 12 }}
      >
        ‹
      </button>

      <img
        src={images[index]}
        alt=""
        draggable={false}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null) return;
          const delta = e.changedTouches[0].clientX - touchStartX.current;
          if (Math.abs(delta) > 45) delta < 0 ? goNext() : goPrev();
          touchStartX.current = null;
        }}
        style={mainImage}
      />

      <button
        type="button"
        aria-label="Next picture"
        onClick={(e) => { e.stopPropagation(); goNext(); }}
        style={{ ...navBtn, right: 12 }}
      >
        ›
      </button>

      {images.length > 1 && (
        <div style={counter}>
          {index + 1} / {images.length}
        </div>
      )}
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  width: "100%",
  height: "100dvh",
  background: "#000",
  zIndex: 99999,
  overflow: "hidden",
};

const mainImage = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  objectPosition: "center",
  userSelect: "none",
};

const closeBtn = {
  position: "absolute",
  top: "max(16px, env(safe-area-inset-top))",
  right: 16,
  zIndex: 3,
  width: 44,
  height: 44,
  borderRadius: "50%",
  border: "1px solid rgba(255,255,255,0.4)",
  background: "rgba(0,0,0,0.45)",
  color: "#fff",
  fontSize: 30,
  lineHeight: 1,
  cursor: "pointer",
};

const navBtn = {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  zIndex: 3,
  width: 44,
  height: 60,
  border: "none",
  borderRadius: 12,
  background: "rgba(0,0,0,0.4)",
  color: "#fff",
  fontSize: 42,
  lineHeight: 1,
  cursor: "pointer",
};

const counter = {
  position: "absolute",
  bottom: "max(20px, env(safe-area-inset-bottom))",
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 3,
  color: "#fff",
  background: "rgba(0,0,0,0.45)",
  borderRadius: 20,
  padding: "6px 12px",
  fontSize: 14,
};
