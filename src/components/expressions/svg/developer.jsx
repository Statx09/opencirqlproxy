import React from "react";

export default function DeveloperIcon({
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
      <rect x="4" y="4" width="16" height="16" rx="2" />

      <polyline points="8 9 5 12 8 15" />

      <polyline points="16 9 19 12 16 15" />

      <line x1="12" y1="8" x2="12" y2="16" />
    </svg>
  );
}