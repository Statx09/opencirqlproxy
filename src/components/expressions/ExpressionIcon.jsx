import React from "react";
import { iconMap } from "./iconMap";

export default function ExpressionIcon({
  type,
  size = 20,
  color,
  animated = true,
}) {
  const config = iconMap[type];

  if (!config) return null;

  /* IMAGE EXPRESSION */
  if (config.type === "image") {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: size,
          height: size,
          flexShrink: 0,
          animation: animated
            ? "expressionPulse 3s ease-in-out infinite"
            : "none",
        }}
      >
        <img
  src={config.src}
  alt=""
  style={{
    width: "170%",
    height: "170%",
    objectFit: "contain",
    display: "block",
  }}
/>
      </span>
    );
  }

  /* EXISTING SVG / LUCIDE EXPRESSIONS */
  const Icon = config.component;
  const iconColor = color || config.color;

  if (!Icon) return null;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,

        filter: animated
          ? `drop-shadow(0 0 6px ${iconColor})`
          : "none",

        animation: animated
          ? "expressionPulse 3s ease-in-out infinite"
          : "none",
      }}
    >
      <Icon
        size={size}
        color={iconColor}
        strokeWidth={2}
      />
    </span>
  );
}
