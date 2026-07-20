import React from "react";
import {
  presenceColor,
  presenceLabel,
} from "../../utils/presences";

export default function PresenceBadge({
  presence = "offline",
  size = "small",
}) {
  const color =
    presenceColor[presence] || presenceColor.offline;

  const label =
    presenceLabel[presence] || "Offline";

  const small = size === "small";

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,

        padding: small ? "4px 10px" : "6px 12px",

        borderRadius: 999,

        background: "rgba(255,255,255,.06)",

        border: `1px solid ${color}40`,

        backdropFilter: "blur(10px)",

        color: "#fff",

        fontSize: small ? 11 : 13,

        fontWeight: 600,
      }}
    >
      <div
        style={{
          width: small ? 8 : 10,
          height: small ? 8 : 10,
          borderRadius: "50%",
          background: color,

          boxShadow: `0 0 10px ${color}`,
        }}
      />

      {label}
    </div>
  );
}