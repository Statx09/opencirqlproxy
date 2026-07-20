import React from "react";

export default function ExpressionSearch({
  value,
  onChange,
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search expressions..."
      style={{
        width: "100%",
        padding: "12px 16px",

        background: "rgba(255,255,255,.05)",

        border: "1px solid rgba(255,255,255,.08)",

        borderRadius: 14,

        color: "#fff",

        fontSize: 14,

        outline: "none",

        marginBottom: 18,
      }}
    />
  );
}