import React from "react";

export default function ModalShell({
  title,
  onClose,
  children,
  zIndex = 99999,
}) {
  return (
    <div style={{ ...overlay, zIndex }}>
      <div style={modal}>

        <div style={header}>
          <div style={titleStyle}>{title}</div>

          <button
            style={closeBtn}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div style={body}>
          {children}
        </div>

      </div>
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.75)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 99999,
};

const modal = {
  width: "100%",
  maxWidth: 700,
  height: "90vh",
  background: "#0b1220",
  borderRadius: 14,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
};

const header = {
  height: 52,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0 14px",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.03)",
};

const titleStyle = {
  color: "#fff",
  fontWeight: 700,
};

const closeBtn = {
  width: 34,
  height: 34,
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(255,255,255,0.05)",
  color: "#fff",
  cursor: "pointer",
};

const body = {
  flex: 1,
  overflow: "auto",
};

