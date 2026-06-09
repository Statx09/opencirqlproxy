import React, { useEffect, useState, useMemo } from "react";

import Hero from "./components/Hero";
import HostCard from "./components/HostCard";
import ProfileModal from "./components/ProfileModal";
import ProfileTab from "./components/ProfileTab";
import TopicSearchBar from "./components/TopicSearchBar";
import ChatsTab from "./components/ChatsTab";
import ConnectionsTab from "./components/ConnectionsTab";
import OpenGuideModal from "./components/OpenGuideModal";
import DiscoveryExplorerModal from "./components/DiscoveryExplorerModal"; // ✅ ADDED

import { supabase } from "./lib/supabaseClient";
import { fetchHosts } from "./api/fetchHosts";
import { getSuggestedHost } from "./lib/matchEngine";

export default function LandingPage() {
  const [hosts, setHosts] = useState([]);
  const [user, setUser] = useState(null);

  const [selectedHost, setSelectedHost] = useState(null);
  const [activeTab, setActiveTab] = useState("Directory");
  const [searchTopic, setSearchTopic] = useState("");

  const [showGuide, setShowGuide] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const [suggestedMatch, setSuggestedMatch] = useState(null);

  // ✅ GUIDE STATE FIX (NEW)
  const [guideMessages, setGuideMessages] = useState([
    {
      role: "assistant",
      content: "Hey 👋 I’m your Open Guide. Ask me anything.",
    },
  ]);

  // ================= EXPLORER STATE (ADDED) =================
  const [explorerOpen, setExplorerOpen] = useState(false);

  // ================= AUTH =================
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user || null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ================= HOSTS =================
  useEffect(() => {
    async function loadHosts() {
      const data = await fetchHosts();
      setHosts(Array.isArray(data) ? data : []);
    }
    loadHosts();
  }, []);

  // ================= MATCH ENGINE =================
  useEffect(() => {
    if (!hosts.length) return;

    const update = () => {
      setSuggestedMatch(getSuggestedHost(hosts, user));
    };

    update();
    const interval = setInterval(update, 6000);
    return () => clearInterval(interval);
  }, [hosts, user]);

  // ================= NOTIFICATIONS =================
  useEffect(() => {
    if (!user?.id) return;

    async function loadNotifications() {
      try {
        const res = await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: user.id }),
        });

        const data = await res.json();
        setNotifications(data.notifications || []);
      } catch (err) {
        console.error("Notifications error:", err);
        setNotifications([]);
      }
    }

    loadNotifications();
  }, [user]);

  // ================= FILTER =================
  const filteredHosts = useMemo(() => {
    if (!searchTopic) return hosts;

    const q = searchTopic.toLowerCase();

    return hosts.filter((host) => {
      const topics = Array.isArray(host.topics) ? host.topics : [];
      return topics.some((t) =>
        String(t).toLowerCase().includes(q)
      );
    });
  }, [hosts, searchTopic]);

  const navBtn = (active) => ({
    padding: "10px 14px",
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
    fontWeight: 700,
    background: active ? "#7c3aed" : "#e5e7eb",
    color: active ? "#fff" : "#111",
  });

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 16 }}>

      {/* HERO */}
      <Hero
        suggestedMatch={suggestedMatch}
        onOpenHost={(host) => setSelectedHost(host)}
        user={user}
        onOpenExplorer={() => setExplorerOpen(true)}   // ✅ ADDED
      />

      {/* NAV */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 20,
          flexWrap: "wrap",
          gap: 10,
        }}
      >

        {/* LEFT TABS */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={() => setActiveTab("Directory")} style={navBtn(activeTab === "Directory")}>
            Directory
          </button>
          <button onClick={() => setActiveTab("Chats")} style={navBtn(activeTab === "Chats")}>
            Chats
          </button>
          <button onClick={() => setActiveTab("Connections")} style={navBtn(activeTab === "Connections")}>
            Connections
          </button>
          <button onClick={() => setActiveTab("Profile")} style={navBtn(activeTab === "Profile")}>
            Profile
          </button>
        </div>

        {/* RIGHT ACTIONS */}
        <div style={{ display: "flex", gap: 10 }}>

          <button
            onClick={() => setShowNotifications(true)}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "none",
              background: "#111827",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            🔔 {notifications.length}
          </button>

          <button
            onClick={() =>
              user
                ? supabase.auth.signOut()
                : supabase.auth.signInWithOAuth({ provider: "google" })
            }
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "none",
              background: user ? "#ef4444" : "#10b981",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {user ? "Logout" : "Login"}
          </button>

        </div>
      </div>

      {/* DIRECTORY */}
      {activeTab === "Directory" && (
        <>
          <div style={{ marginTop: 18 }}>
            <TopicSearchBar value={searchTopic} onChange={setSearchTopic} />
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {filteredHosts.map((host, i) => (
              <HostCard
                key={host.id || host.user_id || i}
                host={host}
                user={user}
                hasProfile={!!user}
                onViewProfile={() => setSelectedHost(host)}
              />
            ))}
          </div>
        </>
      )}

      {/* NOTIFICATIONS MODAL (UNCHANGED) */}
      {showNotifications && (
        <div
          onClick={() => setShowNotifications(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 420,
              maxHeight: 520,
              overflowY: "auto",
              background: "#0f172a",
              borderRadius: 16,
              padding: 16,
              color: "white",
              boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
            }}
          >
            <h3>Notifications</h3>

            {notifications.length === 0 ? (
              <div style={{ opacity: 0.6 }}>No notifications yet</div>
            ) : (
              notifications.map((n, i) => (
                <div
                  key={i}
                  style={{
                    padding: 10,
                    marginBottom: 8,
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.05)",
                  }}
                >
                  {n.message || "Notification"}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* EXPLORER MODAL (ADDED) */}
      {explorerOpen && (
  <DiscoveryExplorerModal
    hosts={hosts}
    user={user}
    onClose={() => setExplorerOpen(false)}
    onOpenHost={(host) => setSelectedHost(host)}
  />
)}
      {/* OTHER TABS */}
      {activeTab === "Chats" && <ChatsTab user={user} hosts={hosts} />}
      {activeTab === "Connections" && <ConnectionsTab user={user} />}
      {activeTab === "Profile" && (
        <ProfileTab user={user} onLogin={() => {}} onSaved={() => {}} />
      )}

      {selectedHost && (
        <ProfileModal host={selectedHost} onClose={() => setSelectedHost(null)} />
      )}

      {/* GUIDE */}
      {!showGuide && (
        <button
          onClick={() => setShowGuide(true)}
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            background: "linear-gradient(135deg,#7c3aed,#0ea5e9)",
            color: "#fff",
            border: "none",
            padding: "12px 16px",
            borderRadius: 999,
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          💬 Help me explore
        </button>
      )}

      {showGuide && (
        <OpenGuideModal
          onClose={() => setShowGuide(false)}
          messages={guideMessages}
          setMessages={setGuideMessages}
        />
      )}
    </div>
  );
}