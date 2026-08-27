import React from "react";
import { iconMap } from "./iconMap";

export default function ExpressionIcon({
  type,
  size = 20,
  color,
  animated = true,
  src,
}) {
  const config = iconMap[type];

  /* EXTERNAL / LOCAL SVG */
  const imageSrc = src || config?.src;

  if (imageSrc) {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: size,
          height: size,
          flexShrink: 0,
          overflow: "visible",
          animation: animated
            ? "expressionPulse 3s ease-in-out infinite"
            : "none",
        }}
      >
        <img
          src={imageSrc}
          alt=""
          style={{
            width: "170%",
            height: "170%",
            objectFit: "contain",
            display: "block",
            filter: animated
              ? `drop-shadow(0 0 3px ${color || config?.color || "#8B5CF6"}55)`
              : "none",
          }}
        />
      </span>
    );
  }

  /* EXISTING LUCIDE / COMPONENT EXPRESSIONS */
  if (!config) return null;

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
