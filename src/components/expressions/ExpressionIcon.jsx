import React from "react";
import { iconMap } from "./iconMap";

export default function ExpressionIcon({
  type,
  size = 20,
  color,
  animated = true,
}) {
  const config = iconMap[type];
  console.log(type, config);

  if (!config) return null;

  const Icon = config.component;
  const iconColor = color || config.color;
  console.log("Icon:", Icon);

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