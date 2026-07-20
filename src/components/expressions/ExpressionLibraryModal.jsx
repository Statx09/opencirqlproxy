import React, { useState } from "react";
import ExpressionSearch from "./ExpressionSearch";
import ExpressionGrid from "./ExpressionGrid";

export default function ExpressionLibraryModal({
  open,
  onClose,
  selected = [],
  onChange,
}) {
  const [search, setSearch] = useState("");

  if (!open) return null;

  const toggle = (id) => {
    if (selected.includes(id)) {
      onChange(selected.filter((x) => x !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={header}>
          <h2 style={{ margin: 0 }}>
            Choose Expressions
          </h2>

          <button
            onClick={onClose}
            style={closeBtn}
          >
            ✕
          </button>
        </div>

        <ExpressionSearch
          value={search}
          onChange={setSearch}
        />

        <div style={body}>
          <ExpressionGrid
            search={search}
            selected={selected}
            onToggle={toggle}
          />
        </div>

        <button
          onClick={onClose}
          style={doneBtn}
        >
          Done
        </button>
      </div>
    </div>
  );
}

/* -------------------- */

const overlay = {
  position: "fixed",
  inset: 0,

  background: "rgba(0,0,0,.65)",

  backdropFilter: "blur(10px)",

  display: "flex",

  justifyContent: "center",

  alignItems: "center",

  zIndex: 9999,
};

const modal = {
  width: "min(900px,95vw)",

  maxHeight: "90vh",

  overflow: "hidden",

  display: "flex",

  flexDirection: "column",

  background: "#111827",

  borderRadius: 22,

  border: "1px solid rgba(255,255,255,.08)",

  padding: 22,
};

const header = {
  display: "flex",

  justifyContent: "space-between",

  alignItems: "center",

  marginBottom: 18,
};

const closeBtn = {
  border: "none",

  background: "transparent",

  color: "#fff",

  cursor: "pointer",

  fontSize: 22,
};

const body = {
  flex: 1,

  overflowY: "auto",

  paddingRight: 6,
};

const doneBtn = {
  marginTop: 18,

  padding: 14,

  border: "none",

  borderRadius: 14,

  background: "#7c3aed",

  color: "#fff",

  fontWeight: 700,

  cursor: "pointer",
};