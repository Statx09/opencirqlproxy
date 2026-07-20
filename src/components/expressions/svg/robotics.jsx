import React from "react";

export default function RoboticsIcon({
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
      <rect x="6" y="7" width="12" height="10" rx="2" />
      <circle cx="10" cy="12" r="1" />
      <circle cx="14" cy="12" r="1" />
      <path d="M12 3v4" />
      <path d="M8 20h8" />
    </svg>
  );
}