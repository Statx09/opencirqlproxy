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

        <button style={iconBtn} onClick={() => onAction("status")}>
          📡
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
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 99999,
  pointerEvents: "none",
};

const bar = {
  pointerEvents: "auto",

  width: "100%",

  display: "flex",
  justifyContent: "space-around",
  alignItems: "center",

  padding: "12px 18px",

  background:
    "rgba(15,23,42,0.82)",

  backdropFilter:
    "blur(20px)",

  WebkitBackdropFilter:
    "blur(20px)",

  borderTop:
    "1px solid rgba(255,255,255,.12)",

  boxShadow:
    "0 -8px 30px rgba(0,0,0,.25)",
};

const iconBtn = {
  width: 48,
  height: 48,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "transparent",
  color: "#fff",
  fontSize: 20,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};