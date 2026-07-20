import React from "react";
import ExpressionIcon from "./ExpressionIcon";

export default function ExpressionCategory({
  title,
  items = [],
  selected = [],
  onToggle,
}) {
  if (!items.length) return null;

  return (
    <div style={{ marginBottom: 28 }}>
      <h3
        style={{
          color: "#fff",
          marginBottom: 14,
          fontSize: 16,
          fontWeight: 700,
        }}
      >
        {title}
      </h3>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        {items.map((item) => {
          const active = selected.includes(item.id);

          return (
            <button
              key={item.id}
              onClick={() => onToggle(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                borderRadius: 999,
                cursor: "pointer",

                background: active
                  ? item.color
                  : "rgba(255,255,255,.05)",

                border: active
                  ? `1px solid ${item.color}`
                  : "1px solid rgba(255,255,255,.08)",

                color: "#fff",

                transition: ".2s",
              }}
            >
              <ExpressionIcon
                type={item.svg}
                size={18}
                color="#fff"
              />

              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}