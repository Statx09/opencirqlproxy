import React from "react";

export default function GamingIcon({
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
      <rect x="3" y="7" width="18" height="12" rx="3" />
      <line x1="8" y1="13" x2="12" y2="13" />
      <line x1="10" y1="11" x2="10" y2="15" />
      <circle cx="16" cy="12" r="1" />
      <circle cx="18" cy="14" r="1" />
    </svg>
  );
}