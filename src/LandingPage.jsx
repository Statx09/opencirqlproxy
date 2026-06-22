import React, { useEffect, useState, useCallback } from "react";

import HostCard from "./components/HostCard";
import DiscoveryPage from "./components/DiscoveryPage";
import ProfileModal from "./components/ProfileModal";
import GlassBar from "./components/GlassBar";

import MessagesModal from "./components/MessagesModal";
import NotificationsModal from "./components/NotificationsModal";
import ConnectionRequests from "./components/ConnectionRequests";
import CallModal from "./components/CallModal";

import { supabase } from "./lib/supabaseClient";
import { fetchHosts } from "./api/fetchHosts";
import { useSwipe } from "./hooks/useSwipe";

export default function LandingPage() {
  const [hosts, setHosts] = useState([]);
  const [user, setUser] = useState(null);

  const [mode, setMode] = useState("grid");
  const [index, setIndex] = useState(0);

  const [activeModal, setActiveModal] = useState(null);
  const [selectedHost, setSelectedHost] = useState(null);

  /* ================= SWIPE ================= */

  const next = () =>
    setIndex((i) => (i + 1) % (hosts.length || 1));

  const prev = () =>
    setIndex((i) => (i - 1 + hosts.length) % hosts.length);

  const { handleStart, handleMove, handleEnd, dragX } = useSwipe({
    onSwipeLeft: next,
    onSwipeRight: prev,
  });

  const current = hosts.length > 0 ? hosts[index] : null;

  /* ================= MODAL SYSTEM ================= */

  const openModal = useCallback((type, host = null) => {
    setSelectedHost(host);
    setActiveModal(type);
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
    setSelectedHost(null);
  }, []);

  /* ================= DATA LOAD ================= */

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user || null);
    });

    fetchHosts().then(setHosts);
  }, []);

  /* ================= RENDER ================= */

  return (
    <div style={page}>

      {/* MODE TOGGLE */}
      <button
        style={modeBtn}
        onClick={() =>
          setMode((m) => (m === "grid" ? "swipe" : "grid"))
        }
      >
        {mode === "grid" ? "Swipe Mode" : "Grid Mode"}
      </button>

      {/* ================= GRID ================= */}
      {mode === "grid" && (
        <DiscoveryPage
          hosts={hosts}
          user={user}
          onOpenHost={(h) => openModal("profile", h)}
        />
      )}

      {/* ================= SWIPE ================= */}
      {mode === "swipe" && current && (
  <div
    style={{
      ...swipeStage,
      transform: `translateX(${dragX}px)`,
      transition:
        dragX === 0 ? "transform 0.25s ease" : "none",
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
      onViewProfile={(h) => openModal("profile", h)}
      onOpenMessage={(h) => openModal("message", h)}
      onOpenCall={(h) => openModal("call", h)}
      onOpenSupport={(h) => openModal("support", h)}
    />
  </div>
)}

      {/* ================= GLASSBAR ================= */}
      <GlassBar
        user={user}
        onNotifications={() => openModal("notifications")}
        onMessages={() => openModal("messages")}
        onConnections={() => openModal("connections")}
        onProfile={() =>
          openModal("profile", current || user)
        }
      />

      {/* ================= MODALS ================= */}

      {activeModal === "profile" && selectedHost && (
        <ProfileModal
          host={selectedHost}
          onClose={closeModal}
        />
      )}

      {activeModal === "messages" && (
        <MessagesModal
          host={selectedHost}
          user={user}
          onClose={closeModal}
        />
      )}

      {activeModal === "notifications" && (
        <NotificationsModal
          user={user}
          onClose={closeModal}
        />
      )}

      {activeModal === "connections" && (
        <ConnectionRequests
          user={user}
          onClose={closeModal}
        />
      )}

      {activeModal === "call" && (
        <CallModal
          host={selectedHost}
          user={user}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

/* ================= STYLES ================= */

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