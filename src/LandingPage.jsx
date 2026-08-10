import React, { useEffect, useState, useCallback } from "react";

import HostCard from "./components/HostCard";
import DiscoveryPage from "./components/DiscoveryPage";
import GlassBar from "./components/GlassBar";
import ModalShell from "./components/ui/ModalShell";
import StatusFeedModal from "./components/StatusFeedModal";
import CallsStudioModal from "./components/CallsStudioModal";
import { useTheme } from "./context/ThemeContext";
import { Sun, Moon } from "lucide-react";


import ChatsTab from "./components/ChatsTab";
import MessagesModal from "./components/MessagesModal";
import NotificationsModal from "./components/NotificationsModal";
import ConnectionRequests from "./components/ConnectionRequests";
import CallModal from "./components/CallModal";
import SayThanksModal from "./components/SayThanksModal";
import ProfileModal from "./components/ProfileModal";
import ProfileTab from "./components/ProfileTab/ProfileTab";

import { fetchHosts } from "./api/fetchHosts";
import { useSwipe } from "./hooks/useSwipe";
import useStatusFeed from "./hooks/useStatusFeed";
import { supabase } from "./lib/supabaseClient";


export default function LandingPage({ user }) {
  const [hosts, setHosts] = useState([]);
  const [mode, setMode] = useState("grid");
  const [index, setIndex] = useState(0);

  const [activeModal, setActiveModal] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [selectedHost, setSelectedHost] = useState(null);

  // Theme
  const { theme, isDark, toggleTheme } = useTheme();

  const handleOpenProfile = async (userId) => {
    console.log("handleOpenProfile received:", userId);

  if (!userId) {
    console.log("No userId passed.");
    return;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  console.log("Profile query result:", data);
  console.log("Profile query error:", error);

  if (error || !data) {
    console.log("Profile not found.");
    return;
  }

  setShowStatusModal(false);
  setSelectedProfile(data);
  setActiveModal("profile");
};

const [showStatusModal, setShowStatusModal] = useState(false);

const statuses = useStatusFeed();

const [refreshChatsKey] = useState(0);

const closeModal = useCallback(() => {
  setActiveModal(null);
  setSelectedProfile(null);
  setSelectedHost(null);
}, []);

const safeLength = hosts?.length || 0;
const hasHosts = safeLength > 0;

  /* ================= SAFE NAV ================= */

  const next = useCallback(() => {
    if (!hasHosts) return;
    setIndex((i) => (i + 1) % safeLength);
  }, [hasHosts, safeLength]);

  const prev = useCallback(() => {
    if (!hasHosts) return;
    setIndex((i) => (i - 1 + safeLength) % safeLength);
  }, [hasHosts, safeLength]);

  /* ================= SWIPE ================= */

  const { handleStart, handleMove, handleEnd, dragX } = useSwipe({
    onSwipeLeft: next,
    onSwipeRight: prev,
  });

  const current = hasHosts ? hosts[index] : null;

  /* ================= LOAD HOSTS ================= */

useEffect(() => {
  fetchHosts().then((data) => {
    console.log("HOST COUNT:", data.length);

    console.table(
      data.map((h) => ({
        alias: h.alias,
        name: h.name,
        id: h.id,
        user_id: h.user_id,
      }))
    );

    setHosts(data || []);
    setIndex(0);
  });
}, []);

  /* ================= ACTION ROUTER ================= */

  const handleAction = useCallback(
    async (type, host = null) => {
      switch (type) {
        case "profile":
  setSelectedHost(host);
  setSelectedProfile(null); // IMPORTANT
  setActiveModal("profile");
  break;

        case "userProfile":
  setActiveModal("userProfile");
  break;

        case "messages":
          setSelectedHost(host);
          setActiveModal("messages");
          break;

        case "chats":
          setActiveModal("chats");
          break;

        case "notifications":
          setActiveModal("notifications");
          break;

        case "status":
         setActiveModal("status");
         break;

        case "connections":
          setActiveModal("connections");
          break;

        case "call":
  setSelectedHost(host || current);
  setActiveModal("callsStudio");
  break;

        case "callsStudio":
  setActiveModal("callsStudio");
  break;

        case "next":
          next();
          break;

        case "prev":
          prev();
          break;

        case "wave":
        case "like":
        case "support": {
          const receiverId = host?.user_id || host?.id;
          if (!receiverId || !user?.id) return;

          if (type === "support") {
            setSelectedHost(host);
            setActiveModal("sayThanks");
            return;
          }

          const text =
            type === "wave"
              ? "👋 waved at you"
              : "❤️ liked you";

          await supabase.from("messages").insert({
            sender_id: user.id,
            receiver_id: receiverId,
            text,
            event: type,
            created_at: new Date().toISOString(),
          });

          setActiveModal("chats");
          setSelectedHost(null);
          break;
        }

        default:
          console.log("UNKNOWN ACTION:", type);
      }
    },
    [user, current, next, prev]
  );

  if (!hasHosts) {
    return <div style={{ color: "#fff", padding: 20 }}>Loading...</div>;
  }

  return (
  <div style={page(theme)}>

{mode === "grid" && (
  <div style={{ ...header(theme), marginBottom: 24 }}>
    <div style={logo}>
      ◉ OpenCall
    </div>

<button
  style={themeToggle(theme)}
  onClick={toggleTheme}
>
  {theme.mode === "dark" ? (
    <Sun size={18} strokeWidth={2.2} />
  ) : (
    <Moon size={18} strokeWidth={2.2} />
  )}
</button>
  </div>
)}

    {/* GRID */}
    {mode === "grid" && (
      <DiscoveryPage
        hosts={hosts}
        user={user}
        onAction={handleAction}
        statuses={statuses}
        mode={mode}
        onToggleMode={() =>
          setMode((m) => (m === "grid" ? "swipe" : "grid"))
        }
        onOpenPulse={() => setShowStatusModal(true)}
        onOpenCallsStudio={() => setActiveModal("callsStudio")}
      />
    )}

      {/* SWIPE */}
{mode === "swipe" && current && (
  <div style={swipeStage}>

    <button
      style={modeBtn}
      onClick={() => setMode("grid")}
    >
      ▦ Grid View
    </button>

    <div
      style={{
        width: "100%",
        height: "100%",
        transform: `translateX(${dragX}px)`,
        transition: dragX === 0 ? "transform 0.25s ease" : "none",
        touchAction: "none",
      }}
      onPointerDown={handleStart}
      onPointerMove={handleMove}
      onPointerUp={handleEnd}
      onPointerCancel={handleEnd}
    >
      <HostCard
        host={current}
        user={user}
        onAction={handleAction}
        onNext={next}
        onPrev={prev}
      />
    </div>

  </div>
)}

      {/* GLASSBAR */}
      <div style={glassWrap}>
        <GlassBar user={user} onAction={handleAction} />
      </div>

      {/* STATUS MODAL */}
{showStatusModal && (
  <StatusFeedModal
  statuses={statuses}
  onClose={() => setShowStatusModal(false)}
  onOpenProfile={handleOpenProfile}
/>
)}

      {/* MODALS */}

      {activeModal === "profile" && (selectedHost || selectedProfile) && (
  <>
    {console.log("SELECTED HOST:", selectedHost)}
    {console.log("SELECTED PROFILE:", selectedProfile)}

    <ProfileModal
      host={
        selectedHost
          ? selectedHost
          : { user_id: selectedProfile?.user_id }
      }
      onClose={closeModal}
    />
  </>
)}

      {activeModal === "userProfile" && (
        <ModalShell title="Identity Studio" onClose={closeModal}>
          <ProfileTab user={user} />
        </ModalShell>
      )}

      {activeModal === "messages" && selectedHost && (
        <MessagesModal
          host={selectedHost}
          user={user}
          onClose={closeModal}
        />
      )}

      {activeModal === "chats" && (
        <ModalShell title="Chats" onClose={closeModal}>
          <ChatsTab
            user={user}
            hosts={hosts}
            refreshKey={refreshChatsKey}
            onOpenChat={(h) => handleAction("messages", h)}
          />
        </ModalShell>
      )}

      {activeModal === "notifications" && (
        <ModalShell title="Notifications" onClose={closeModal}>
          <NotificationsModal notifications={[]} />
        </ModalShell>
      )}

      {activeModal === "status" && (
  <StatusFeedModal
    statuses={statuses}
    onClose={closeModal}
    onOpenProfile={(host) => handleAction("profile", host)}
  />
)}

      {activeModal === "connections" && (
        <ModalShell title="Connections" onClose={closeModal}>
          <ConnectionRequests user={user} />
        </ModalShell>
      )}

      {activeModal === "call" && (
        <CallModal
          host={selectedHost}
          user={user}
          onClose={closeModal}
        />
      )}

      {activeModal === "callsStudio" && (
  <CallsStudioModal
    user={user}
    host={selectedHost}
    onClose={closeModal}
  />
)}

      {activeModal === "sayThanks" && selectedHost && (
        <SayThanksModal
          host={selectedHost}
          user={user}
          onClose={closeModal}
        />
      )}

    </div>
  );
}

/* ================= STYLES ================= */

const page = (theme) => ({
  width: "100%",
  minHeight: "100vh",
  background: theme.background,
  color: theme.text,
  transition: "all .25s ease",
});

const header = (theme) => ({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,

  height: 64,

  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",

  padding: "0 20px",

  background: theme.glass,
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",

  borderBottom: `1px solid ${theme.border}`,

  zIndex: 9000,
});

const logo = {
  fontSize: 22,
  fontWeight: 700,
  letterSpacing: ".5px",
};

const themeToggle = (theme) => ({
  width: 42,
  height: 42,

  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  borderRadius: "50%",

  background: "rgba(255,255,255,0.08)",

  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",

  border: "1px solid rgba(255,255,255,.15)",

  color: theme.text,

  boxShadow:
    "0 4px 18px rgba(0,0,0,.28), inset 0 1px rgba(255,255,255,.05)",

  cursor: "pointer",

  transition: "all .25s ease",
});

const modeBtn = {
  position: "fixed",
  top: 80, // moved below header
  left: 16,
  zIndex: 9999,

  height: 46,
  padding: "0 18px",

  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  borderRadius: 14,
  border: "1px solid rgba(255,255,255,.12)",

  background: "rgba(20,20,25,.85)",

  color: "#fff",
  fontWeight: 600,
  fontSize: 15,

  cursor: "pointer",
};

const swipeStage = {
  width: "100vw",
  height: "100vh",
  overflow: "hidden",
};

const glassWrap = {
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 1000,
};