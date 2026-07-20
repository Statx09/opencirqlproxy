export const colors = {
  bg: "#0b1220",
  panel: "#121a2b",
  panelAlt: "#182235",
  border: "rgba(255,255,255,0.08)",
  text: "#ffffff",
  muted: "#9ca3af",
  accent: "#7c3aed",
  success: "#22c55e",
};

export const styles = {
  page: {
    padding: 20,
    color: colors.text,
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },

  glass: {
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(18px)",
    borderRadius: 18,
    border: `1px solid ${colors.border}`,
    padding: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 14,
  },

  input: {
    width: "100%",
    padding: 12,
    borderRadius: 12,
    border: `1px solid ${colors.border}`,
    background: "#101827",
    color: "#fff",
    outline: "none",
    boxSizing: "border-box",
  },

  textarea: {
    width: "100%",
    minHeight: 90,
    padding: 12,
    borderRadius: 12,
    border: `1px solid ${colors.border}`,
    background: "#101827",
    color: "#fff",
    resize: "vertical",
    boxSizing: "border-box",
  },

  saveButton: {
    padding: 14,
    borderRadius: 14,
    background: colors.accent,
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontWeight: 700,
  },
};