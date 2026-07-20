import React from "react";

export default function CoffeeIcon({
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
      <path d="M6 8h10v7a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V8z" />
      <path d="M16 10h2a3 3 0 0 1 0 6h-2" />
      <line x1="8" y1="4" x2="8" y2="6" />
      <line x1="12" y1="4" x2="12" y2="6" />
    </svg>
  );
}