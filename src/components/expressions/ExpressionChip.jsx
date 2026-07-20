import React from "react";
import ExpressionIcon from "./ExpressionIcon";

export default function ExpressionChip({
  expression,
  selected = false,
  size = 52,
  onClick,
}) {
  if (!expression) return null;

  return (
    <button
      onClick={onClick}
      title={expression.label}
      style={{
        width: size,
        height: size,

        borderRadius: "999px",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        padding: 0,
        flexShrink: 0,
        cursor: "pointer",

        background: "rgba(255,255,255,0.09)",

        backdropFilter: "blur(22px)",
        WebkitBackdropFilter: "blur(22px)",

        border: `1px solid ${
          selected
            ? expression.color
            : "rgba(255,255,255,0.12)"
        }`,

        boxShadow: selected
          ? `0 0 18px ${expression.color}66`
          : "0 8px 24px rgba(0,0,0,.28)",

        transition:
          "transform .18s ease, box-shadow .18s ease, border-color .18s ease, background .18s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform =
          "translateY(-3px) scale(1.05)";

        if (!selected) {
          e.currentTarget.style.borderColor = expression.color;
          e.currentTarget.style.boxShadow = `0 0 16px ${expression.color}44`;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform =
          "translateY(0) scale(1)";

        if (!selected) {
          e.currentTarget.style.borderColor =
            "rgba(255,255,255,0.12)";
          e.currentTarget.style.boxShadow =
            "0 8px 24px rgba(0,0,0,.28)";
        }
      }}
    >
      <ExpressionIcon
        type={expression.svg}
        size={22}
        color={expression.color}
      />
    </button>
  );
}