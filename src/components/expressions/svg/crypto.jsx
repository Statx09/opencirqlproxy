import React from "react";

export default function CryptoIcon({
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
      <circle cx="12" cy="12" r="9" />
      <path d="M9 8h5a2 2 0 0 1 0 4H9" />
      <path d="M9 12h5a2 2 0 0 1 0 4H9" />
      <line x1="12" y1="6" x2="12" y2="18" />
    </svg>
  );
}