// src/HostGrid.jsx
import React from "react";

export default function HostGrid({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, 220px)", gap: 16, justifyContent: "center" }}>{children}</div>;
}
