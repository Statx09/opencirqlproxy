import React, { useState } from "react";
import { styles } from "./profileStyles";

import ExpressionBadges from "../expressions/ExpressionBadges";
import ExpressionGrid from "../expressions/ExpressionGrid";

export default function ExpressSection({
  expressions: selectedExpressions = [],
  setExpressions,
}) {
  const [search, setSearch] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);

  const MAX_EXPRESSIONS = 10;

  const uniqueSelectedExpressions = [
    ...new Set(
      Array.isArray(selectedExpressions)
        ? selectedExpressions
        : []
    ),
  ];

  const toggle = (value) => {
    if (uniqueSelectedExpressions.includes(value)) {
      setExpressions(
        uniqueSelectedExpressions.filter((x) => x !== value)
      );
      return;
    }

    if (uniqueSelectedExpressions.length >= MAX_EXPRESSIONS) {
      alert("You can select up to 10 identity icons.");
      return;
    }

    setExpressions([...uniqueSelectedExpressions, value]);
  };

  return (
    <div style={styles.glass}>
      <div
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: "#fff",
          marginBottom: 4,
        }}
      >
        Expressions
      </div>

      <div
        style={{
          fontSize: 12,
          color: "#9ca3af",
          marginBottom: 14,
        }}
      >
        Choose up to 10 icons that represent you.
      </div>

      {/* Selected expressions */}
      <div
        style={{
          padding: 14,
          borderRadius: 14,
          background: "rgba(255,255,255,.035)",
          border: "1px solid rgba(255,255,255,.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: uniqueSelectedExpressions.length ? 12 : 0,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            Selected
          </div>

          <div
            style={{
              fontSize: 12,
              color: "#9ca3af",
            }}
          >
            {uniqueSelectedExpressions.length}/{MAX_EXPRESSIONS}
          </div>
        </div>

        {uniqueSelectedExpressions.length > 0 ? (
          <ExpressionBadges
            badges={uniqueSelectedExpressions}
            max={MAX_EXPRESSIONS}
            showLabels
            onRemove={toggle}
          />
        ) : (
          <div
            style={{
              fontSize: 12,
              color: "#777",
            }}
          >
            No expressions selected yet.
          </div>
        )}
      </div>

      {/* Picker toggle */}
      <button
        type="button"
        onClick={() => setPickerOpen((open) => !open)}
        style={{
          width: "100%",
          marginTop: 12,
          minHeight: 44,
          borderRadius: 12,
          border: "1px solid rgba(124,58,237,.45)",
          background: "rgba(124,58,237,.14)",
          color: "#fff",
          cursor: "pointer",
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        {pickerOpen ? "Done" : "+ Add expressions"}
      </button>

      {/* Expression picker */}
      {pickerOpen && (
        <div
          style={{
            marginTop: 12,
            padding: 14,
            borderRadius: 14,
            background: "rgba(0,0,0,.16)",
            border: "1px solid rgba(255,255,255,.08)",
          }}
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search expressions..."
            autoFocus
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "11px 13px",
              marginBottom: 14,
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,.10)",
              background: "rgba(255,255,255,.05)",
              color: "#fff",
              outline: "none",
              fontSize: 13,
            }}
          />

          <div
            style={{
              fontSize: 11,
              color: "#777",
              marginBottom: 12,
            }}
          >
            Tap an expression to add or remove it.
          </div>

          <ExpressionGrid
            selected={uniqueSelectedExpressions}
            search={search}
            onToggle={toggle}
          />
        </div>
      )}
    </div>
  );
}
