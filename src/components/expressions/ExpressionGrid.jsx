import React, { useMemo } from "react";
import ExpressionIcon from "./ExpressionIcon";
import { expressions } from "./expressions";

export default function ExpressionGrid({
  selected = [],
  search = "",
  onToggle,
}) {
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return expressions.filter((item) => {
      // Hide expressions already selected
      if (selected.includes(item.id)) return false;

      if (!q) return true;

console.log("ExpressionGrid expressions:", expressions);
console.log("Filtered:", filtered);

      return (
        item.label.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        (item.keywords || []).some((k) =>
          k.toLowerCase().includes(q)
        )
      );
    });
  }, [search, selected]);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
      }}
    >
      {filtered.map((item) => (
  <button
    key={item.id}
    onClick={() => onToggle(item.id)}
    title={item.label}
    style={{
      width: 56,
      height: 56,

      display: "flex",
      alignItems: "center",
      justifyContent: "center",

      borderRadius: "50%",

      cursor: "pointer",

      background: "rgba(255,255,255,.05)",

      border: "1px solid rgba(255,255,255,.08)",

      transition: "all .18s ease",

      backdropFilter: "blur(10px)",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-3px) scale(1.08)";
      e.currentTarget.style.borderColor = item.color;
      e.currentTarget.style.background = `${item.color}22`;
      e.currentTarget.style.boxShadow = `0 0 18px ${item.color}55`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0) scale(1)";
      e.currentTarget.style.borderColor = "rgba(255,255,255,.08)";
      e.currentTarget.style.background = "rgba(255,255,255,.05)";
      e.currentTarget.style.boxShadow = "none";
    }}
  >
    <ExpressionIcon
      type={item.svg}
      size={26}
      color={item.color}
    />
  </button>
))}

      {!filtered.length && (
        <div
          style={{
            color: "#888",
            padding: "10px 0",
          }}
        >
          No matching expressions.
        </div>
      )}
    </div>
  );
}