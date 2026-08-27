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
      if (!q) return true;

      return (
        item.label.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        (item.keywords || []).some((k) =>
          k.toLowerCase().includes(q)
        )
      );
    });
  }, [search]);

  return (
    <div
  onClick={() => console.log("GRID CLICKED")}
  style={{
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  }}
>
      {filtered.map((item) => {
        const isSelected = selected.includes(item.id);

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              console.log("EXPRESSION CLICKED:", item.id);
              console.log("CURRENT SELECTED:", selected);
              onToggle(item.id);
            }}
            title={
              isSelected
                ? `Remove ${item.label}`
                : item.label
            }
            style={{
              width: 56,
              height: 56,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              cursor: "pointer",

              background: isSelected
                ? `${item.color}30`
                : "rgba(255,255,255,.05)",

              border: isSelected
                ? `2px solid ${item.color}`
                : "1px solid rgba(255,255,255,.08)",

              boxShadow: isSelected
                ? `0 0 18px ${item.color}55`
                : "none",

              transition: "all .18s ease",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            <ExpressionIcon
              type={item.svg}
              src={item.src}
              size={26}
              color={item.color}
            />
          </button>
        );
      })}

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


