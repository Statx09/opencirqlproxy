import React from "react";
import ExpressionChip from "./ExpressionChip";
import { expressions } from "./expressions";

export default function ExpressionBadges({
  badges = [],
  max = 4,
  showLabels = false,
  size = 48,
}) {
  if (!badges.length) return null;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
      }}
    >
      {badges.slice(0, max).map((id) => {
        const expression = expressions.find(
          (e) => e.id === id
        );

        if (!expression) return null;

        return (
          <ExpressionChip
  key={id}
  expression={expression}
  size={size}
/>
        );
      })}
    </div>
  );
}