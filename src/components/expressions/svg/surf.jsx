import React from "react";

export default function SurfIcon({
  size = 18,
  color = "currentColor",
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 18c4-4 14-4 18 0" />
      <path d="M5 18c2 2 12 2 14 0" />
      <path d="M12 4c3 4 4 7 4 10" />
    </svg>
  );
}