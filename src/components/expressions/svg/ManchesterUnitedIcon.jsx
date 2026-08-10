import React from "react";

export default function ManchesterUnitedIcon({
  size = 18,
  color = "#DA291C",
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      {/* Red football badge */}
      <circle
        cx="12"
        cy="12"
        r="10"
        fill={color}
        stroke="#fff"
        strokeWidth="1"
      />

      {/* Football */}
      <circle
        cx="12"
        cy="7"
        r="2"
        fill="#fff"
      />

      <path
        d="M12 5.8L11.3 6.6L11.6 7.6H12.4L12.7 6.6Z"
        fill={color}
      />

      {/* Manchester United abbreviation */}
      <text
        x="12"
        y="14.2"
        textAnchor="middle"
        fill="#fff"
        fontSize="4.2"
        fontWeight="900"
        fontFamily="Arial, sans-serif"
      >
        MUN
      </text>

      {/* Football club stripe */}
      <path
        d="M7 17.2H17"
        stroke="#fff"
        strokeWidth="1"
        strokeLinecap="round"
      />

      {/* Small star-like accent */}
      <path
        d="M12 18.2l.45.9 1 .15-.72.7.17 1-.9-.47-.9.47.17-1-.72-.7 1-.15Z"
        fill="#fff"
      />
    </svg>
  );
}
