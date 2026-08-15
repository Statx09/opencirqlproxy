import {
  Bell,
  MessageCircle,
  Newspaper,
  Users,
  UserRound,
} from "lucide-react";

import { useTheme } from "../context/ThemeContext";
import { useUser } from "../hooks/useUser";

export default function GlassBar({ user, onAction }) {
  const isLoggedIn = !!user;
  const { theme } = useTheme();
  const { login } = useUser();

  return (
    <div style={wrap}>
      <div style={bar(theme)}>

        <button
          style={iconBtn}
          onClick={() => onAction("notifications")}
        >
          <Bell size={21} strokeWidth={2.1} />
        </button>

        <button
          style={iconBtn}
          onClick={() => onAction("chats")}
        >
          <MessageCircle size={21} strokeWidth={2.1} />
        </button>

        <button
          style={iconBtn}
          onClick={() => onAction("status")}
        >
          <Newspaper size={21} strokeWidth={2.1} />
        </button>

        <button
          style={iconBtn}
          onClick={() => onAction("connections")}
        >
          <Users size={21} strokeWidth={2.1} />
        </button>

        <button
          style={{
            ...iconBtn,
            border: isLoggedIn
              ? "1px solid rgba(34,197,94,0.8)"
              : "1px solid rgba(239,68,68,0.8)",
          }}
          onClick={() => {
            if (isLoggedIn) {
              onAction("userProfile");
            } else {
              login();
            }
          }}
        >
          <UserRound size={21} strokeWidth={2.1} />
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

const bar = (theme) => ({
  pointerEvents: "auto",

  display: "flex",
  justifyContent: "space-around",
  alignItems: "center",

  width: "100%",
  height: 72,

  padding: "0 18px",

  background: theme.glass,

  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",

  borderTop: `1px solid ${theme.border}`,

  boxShadow:
    theme.mode === "dark"
      ? "0 -8px 24px rgba(0,0,0,.35)"
      : "0 -6px 18px rgba(0,0,0,.08)",
});

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
