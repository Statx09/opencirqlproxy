export default function GlassBar({ user, onAction }) {
  const isLoggedIn = !!user;

  return (
    <div style={wrap}>
      <div style={bar}>

        <button style={iconBtn} onClick={() => onAction("notifications")}>
          🔔
        </button>

        <button style={iconBtn} onClick={() => onAction("chats")}>
          💬
        </button>

        <button style={iconBtn} onClick={() => onAction("connections")}>
          👥
        </button>

        <button
          style={{
            ...iconBtn,
            border: isLoggedIn
              ? "1px solid rgba(34,197,94,0.8)"
              : "1px solid rgba(239,68,68,0.8)",
          }}
          onClick={() => onAction("userProfile")}
        >
          👤
        </button>

      </div>
    </div>
  );
}

const wrap = {
  position: "fixed",
  bottom: 16,
  left: 0,
  right: 0,
  display: "flex",
  justifyContent: "center",
  zIndex: 99999,
  pointerEvents: "none",
};

const bar = {
  pointerEvents: "auto",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 22,
  padding: "14px 20px",
  width: "94%",
  maxWidth: 540,
  background: "rgba(15, 23, 42, 0.28)",
  backdropFilter: "blur(18px)",
  borderRadius: 26,
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
};

const iconBtn = {
  width: 56,
  height: 56,
  borderRadius: 18,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.05)",
  color: "#fff",
  fontSize: 20,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};