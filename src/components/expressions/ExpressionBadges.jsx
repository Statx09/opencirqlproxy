import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import ExpressionChip from "./ExpressionChip";
import ExpressionIcon from "./ExpressionIcon";
import { expressions } from "./expressions";

export default function ExpressionBadges({
  badges = [],
  max = 4,
  showLabels = false,
  size = 48,
  onRemove,
}) {
  const [expandedExpression, setExpandedExpression] = useState(null);

  useEffect(() => {
    if (!expandedExpression) return;

    const timer = window.setTimeout(() => {
      setExpandedExpression(null);
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [expandedExpression]);

  if (!badges.length) return null;

  return (
    <>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          position: "relative",
          zIndex: 100,
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
              selected={true}
              onClick={(e) => {
                e?.preventDefault?.();
                e?.stopPropagation?.();

                console.log(
                  "🔥 EXPRESSION EXPANDED:",
                  expression.id,
                  expression.label
                );

                setExpandedExpression(expression);
              }}
            />
          );
        })}
      </div>

      {expandedExpression &&
        createPortal(
          <div
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setExpandedExpression(null);
            }}
            style={{
              position: "fixed",
              inset: 0,

              zIndex: 2147483647,

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              pointerEvents: "none",

              animation:
                "expressionPreviewIn .22s ease-out",
            }}
          >
            <div
              style={{
                width: "min(70vw, 300px)",
                height: "min(70vw, 300px)",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                pointerEvents: "none",

                filter: `drop-shadow(0 12px 35px ${
                  expandedExpression.color || "#8B5CF6"
                }66)`,

                animation:
                  "expressionPreviewPop .22s ease-out",
              }}
            >
              <ExpressionIcon
                type={expandedExpression.svg}
                src={expandedExpression.src}
                size={250}
                color={expandedExpression.color}
                animated={true}
              />
            </div>

            <style>
              {`
                @keyframes expressionPreviewIn {
                  from {
                    opacity: 0;
                  }
                  to {
                    opacity: 1;
                  }
                }

                @keyframes expressionPreviewPop {
                  0% {
                    transform: scale(0.55);
                    opacity: 0;
                  }

                  70% {
                    transform: scale(1.08);
                    opacity: 1;
                  }

                  100% {
                    transform: scale(1);
                    opacity: 1;
                  }
                }
              `}
            </style>
          </div>,
          document.body
        )}
    </>
  );
}
