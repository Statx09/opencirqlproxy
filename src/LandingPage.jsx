import React, { useEffect, useState } from "react";

import HostCard from "./components/HostCard";
import DiscoveryPage from "./components/DiscoveryPage";
import ProfileModal from "./components/ProfileModal";
import GlassBar from "./components/GlassBar";

import { supabase } from "./lib/supabaseClient";
import { fetchHosts } from "./api/fetchHosts";
import { useSwipe } from "./hooks/useSwipe";

export default function LandingPage() {
  const [hosts, setHosts] = useState([]);
  const [user, setUser] = useState(null);

  const [mode, setMode] = useState("grid");
  const [index, setIndex] = useState(0);

  const [selectedHost, setSelectedHost] = useState(null);

  const next = () =>
    setIndex((i) => (i + 1) % (hosts.length || 1));

  const prev = () =>
    setIndex((i) => (i - 1 + hosts.length) % hosts.length);

  const { handleStart, handleMove, handleEnd, dragX } = useSwipe({
    onSwipeLeft: next,
    onSwipeRight: prev,
  });

  const current = hosts.length > 0 ? hosts[index] : null;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user || null);
    });

    fetchHosts().then(setHosts);
  }, []);

  return (
    <div style={page}>

      {/* MODE TOGGLE */}
      <button style={modeBtn} onClick={() => setMode(m => m === "grid" ? "swipe" : "grid")}>
        {mode === "grid" ? "Swipe Mode" : "Grid Mode"}
      </button>

      {/* GRID */}
      {mode === "grid" && (
        <DiscoveryPage
          hosts={hosts}
          user={user}
          onOpenHost={(h) => setSelectedHost(h)}
        />
      )}

      {/* SWIPE */}
      {mode === "swipe" && current && (
        <div
          style={{
            ...swipeStage,
            transform: `translateX(${dragX}px)`,
            transition: dragX === 0 ? "transform 0.35s ease" : "none",
            touchAction: "pan-y",
          }}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        >
          <HostCard
            host={current}
            user={user}
            onViewProfile={(h) => setSelectedHost(h)}
            onOpenMessage={(h) => console.log("msg", h)}
            onOpenCall={(h) => console.log("call", h)}
            onOpenSupport={(h) => console.log("support", h)}
          />
        </div>
      )}
<GlassBar
  user={user}
  onNotifications={() => console.log("notifications")}
  onMessages={() => console.log("messages")}
  onConnections={() => console.log("connections")}
  onProfile={() => {
    if (!user) {
      supabase.auth.signInWithOAuth({
        provider: "google",
      });
      return;
    }

    setSelectedHost(current || user);
  }}
/>

      {/* PROFILE MODAL */}
      {selectedHost && (
        <ProfileModal
          host={selectedHost}
          onClose={() => setSelectedHost(null)}
        />
      )}

      {/* ================= GLASS BAR (RESTORED + WIRED) ================= */}
      <div style={tabs}>
        <button onClick={() => console.log("notifications")}>🔔</button>
        <button onClick={() => console.log("messages")}>💬</button>
        <button onClick={() => console.log("connections")}>👥</button>

        <button
          onClick={() => {
            if (!user) {
              supabase.auth.signInWithOAuth({ provider: "google" });
            } else {
              setSelectedHost(current || user);
            }
          }}
        >
          👤
        </button>

        {user && (
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              setUser(null);
            }}
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
}

/* styles unchanged */
const page = {
  width: "100%",
  height: "100%",
  background: "#0b1220",
  overflow: "hidden",
};

const modeBtn = {
  position: "fixed",
  top: 16,
  left: 16,
  padding: "10px 14px",
  background: "#7c3aed",
  color: "#fff",
  borderRadius: 12,
  zIndex: 9999,
};

const swipeStage = {
  width: "100vw",
  height: "100dvh",
  position: "relative",
};

/* YOUR ORIGINAL GLASS BAR */
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