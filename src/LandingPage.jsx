import React, { useEffect, useState } from "react";

import HostCard from "./components/HostCard";
import ProfileModal from "./components/ProfileModal";
import DiscoveryExplorerModal from "./components/DiscoveryExplorerModal";
import ChatsTab from "./components/ChatsTab";
import ConnectionsTab from "./components/ConnectionsTab";
import ProfileTab from "./components/ProfileTab";
import NotificationsModal from "./components/NotificationsModal";

import { Bell, MessageCircle, Users, User } from "lucide-react";

import { supabase } from "./lib/supabaseClient";
import { fetchHosts } from "./api/fetchHosts";
import { getSuggestedHost } from "./lib/matchEngine";

export default function LandingPage() {
  const [hosts, setHosts] = useState([]);
  const [user, setUser] = useState(null);

  const isLoggedIn = !!user;

  const [index, setIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("Discover");

  const [selectedHost, setSelectedHost] = useState(null);
  const [explorerOpen, setExplorerOpen] = useState(false);

  // ================= STATE =================
const [suggestedMatch, setSuggestedMatch] = useState(null);
const [showNotifications, setShowNotifications] = useState(false);
const [notifications, setNotifications] = useState([]);

const [showLoginPrompt, setShowLoginPrompt] = useState(false);

// ================= DERIVED VALUES =================
const current = hosts[index];
const profileBtnStyle = {
  ...iconBtn,

  border: isLoggedIn
    ? "1px solid rgba(34,197,94,0.8)"   // green (logged in)
    : "1px solid rgba(239,68,68,0.8)",  // red (logged out)

  boxShadow: isLoggedIn
    ? "0 0 14px rgba(34,197,94,0.45)"
    : "0 0 14px rgba(239,68,68,0.45)",
};

// ================= AUTH HELPER =================
const requireLogin = () => {
  if (!user) {
    supabase.auth.signInWithOAuth({ provider: "google" });
    return false;
  }
  return true;
};
const logout = async () => {
  await supabase.auth.signOut();
  setUser(null);
};


  // SWIPE STATE
  const [startX, setStartX] = useState(null);

  const next = () =>
    setIndex((i) => (i + 1) % (hosts.length || 1));

  const prev = () =>
    setIndex((i) => (i - 1 + hosts.length) % (hosts.length || 1));

  const handleStart = (e) => {
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    setStartX(x);
  };

  const handleEnd = (e) => {
    if (startX === null) return;

    const x = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const diff = x - startX;

    if (diff > 80) prev();
    if (diff < -80) next();

    setStartX(null);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user || null);
    });
  }, []);
useEffect(() => {
  const { data: listener } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      setUser(session?.user || null);
    }
  );

  return () => listener.subscription.unsubscribe();
}, []);

  useEffect(() => {
    fetchHosts().then(setHosts);
  }, []);

  useEffect(() => {
    if (!hosts.length) return;
    setSuggestedMatch(getSuggestedHost(hosts, user));
  }, [hosts, user]);

  const isModalOpen =
  explorerOpen ||
  selectedHost ||
  showNotifications ||
  activeTab !== "Discover";

  return (
    <div style={page}>

      {/* ================= DISCOVER ================= */}
      {activeTab === "Discover" && current && !isModalOpen && (
  <div
    style={wrap}
    onMouseDown={handleStart}
    onMouseUp={handleEnd}
    onTouchStart={handleStart}
    onTouchEnd={handleEnd}
  >

    {/* DISCOVER BUTTON */}
    <button
      style={{ ...discoverBtn, zIndex: 999999 }}
      onClick={() => setExplorerOpen(true)}
    >
      🔍 Discover
    </button>

    {/* HOST CARD */}
    <HostCard
      host={current}
      user={user}
      hasProfile={!!user}
      onViewProfile={() => setSelectedHost(current)}
      onOpenExplorer={() => setExplorerOpen(true)}
    />

    {/* NAV ARROWS */}
    <button style={sideArrowLeft} onClick={prev}>
      ◀
    </button>

    <button style={sideArrowRight} onClick={next}>
      ▶
    </button>

    {/* BOTTOM TABS */}
    <div style={bottomWrap}>
      <div style={tabs}>
        <button onClick={() => setShowNotifications(true)} style={iconBtn}>
          <Bell size={28} strokeWidth={2.5} />
        </button>

        <button onClick={() => setActiveTab("Chats")} style={iconBtn}>
          <MessageCircle size={28} strokeWidth={2.5} />
        </button>

        <button onClick={() => setActiveTab("Connections")} style={iconBtn}>
          <Users size={28} strokeWidth={2.5} />
        </button>

        <button
  style={profileBtnStyle}
  onClick={() => {
  if (!isLoggedIn) {
    supabase.auth.signInWithOAuth({ provider: "google" });
    return;
  }

  setActiveTab("Profile");
}}
>
  <User size={28} strokeWidth={2.5} />
</button>
      </div>
    </div>

  </div>
)}


      {/* ================= OTHER TABS ================= */}
      {activeTab === "Chats" && (
        <div style={tabPage}>
          <button style={closeBtn} onClick={() => setActiveTab("Discover")}>
            ✕
          </button>
          <ChatsTab user={user} hosts={hosts} />
        </div>
      )}

      {activeTab === "Connections" && (
        <div style={tabPage}>
          <button style={closeBtn} onClick={() => setActiveTab("Discover")}>
            ✕
          </button>
          <ConnectionsTab user={user} />
        </div>
      )}

      {activeTab === "Profile" && (
        <div style={tabPage}>
          <button style={closeBtn} onClick={() => setActiveTab("Discover")}>
            ✕
          </button>
          <ProfileTab user={user} onLogout={logout} />
        </div>
      )}

      {/* MODALS */}
      {explorerOpen && (
        <DiscoveryExplorerModal
          hosts={hosts}
          user={user}
          onClose={() => setExplorerOpen(false)}
          onOpenHost={setSelectedHost}
        />
      )}

      {selectedHost && (
        <ProfileModal
          host={selectedHost}
          onClose={() => setSelectedHost(null)}
        />
      )}

      {showNotifications && (
        <NotificationsModal
          notifications={notifications}
          onClose={() => setShowNotifications(false)}
        />
      )}

    </div>
  );
}


/* ================= STYLES ================= */

const page = {
  height: "100%",
  width: "100%",
  margin: 0,
  padding: 0,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
};
const wrap = {
  flex: 1,
  width: "100vw",
  height: "100dvh",
  display: "flex",
  flexDirection: "column",   
  alignItems: "stretch",     
  justifyContent: "stretch",
  position: "relative",
  overflow: "hidden",
};
const tabPage = {
  flex: 1,
  width: "100%",
  height: "100%",
  position: "relative",

  overflowY: "auto",   // ✅ allow scrolling
  overflowX: "hidden",

  display: "flex",
};

const closeBtn = {
  position: "absolute",
  top: 12,
  right: 12,
  zIndex: 1000,

  width: 40,
  height: 40,
  borderRadius: "50%",

  border: "none",
  background: "rgba(255,255,255,0.06)",
  color: "#fff",

  fontSize: 18,

  display: "flex",
alignItems: "stretch",
justifyContent: "stretch",

  backdropFilter: "blur(10px)",
  cursor: "pointer",
};

/* ================= BOTTOM DOCK WRAPPER ================= */

const bottomWrap = {
  position: "fixed",
  bottom: 10,     // 🔥 balanced spacing
  left: 0,
  right: 0,

  display: "flex",
  justifyContent: "center",
  alignItems: "center",

  zIndex: 9999,
};

/* ================= GLASS BAR ================= */

const tabs = {
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

/* ================= ICON BUTTONS ================= */

const iconBtn = {
  position: "relative",

  width: 60,
  height: 60,

  borderRadius: 18,

  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",

  cursor: "pointer",
  color: "#cbd5f5",

  fontSize: 24,

  transition: "all 0.2s ease",
};

/* ================= BADGE ================= */

const badge = {
  position: "absolute",
  top: 6,
  right: 6,

  background: "#ef4444",
  color: "#fff",

  fontSize: 10,
  fontWeight: 700,

  borderRadius: 999,
  padding: "2px 6px",
};

/* ================= ARROWS ================= */

/* ================= ARROWS ================= */

const sideArrowBase = {
  position: "fixed",
  bottom: 120,

  width: 52,
  height: 52,

  borderRadius: "50%",

  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(20,20,20,0.75)",

  color: "#fff",

  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  fontSize: 18,
  fontWeight: 700,

  cursor: "pointer",

  zIndex: 99999,
  pointerEvents: "auto",
};

const sideArrowLeft = {
  ...sideArrowBase,
  left: 16,
};

const sideArrowRight = {
  ...sideArrowBase,
  right: 16,
};
/* ================= DISCOVER BUTTON ================= */

const discoverBtn = {
  position: "absolute",
  top: 35,
  left: 18,

  background: "#7c3aed",
  color: "#fff",

  border: "none",
  borderRadius: 16,

  padding: "14px 18px",   
  fontSize: 16,           
  fontWeight: 900,

  display: "flex",
  alignItems: "center",
  gap: 10,

  zIndex: 30,
  cursor: "pointer",

  boxShadow: "0 10px 25px rgba(124,58,237,0.4)",
};
