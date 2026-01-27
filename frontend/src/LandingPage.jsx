// src/LandingPage.jsx
import React, { useState, useEffect } from "react";
import Hero from "./Hero.jsx";
import HostCards from "./HostCards.jsx";
import ChatRequests from "./ChatRequests.jsx";
import TopicSearchBar from "./TopicSearchBar.jsx";
import ProfileTab from "./ProfileTab.jsx";
import ReferralCommisionTab from "./ReferralCommisionTab.jsx";
import ProfileModal from "./ProfileModal.jsx";
import TipHostButton from "./TipHostButton.jsx";
import { supabase } from "./supabaseClient.js";
import { fetchHosts } from "./fetchHosts.js";

export default function LandingPage() {
  const [hosts, setHosts] = useState([]);
  const [searchTopic, setSearchTopic] = useState("");
  const [currentHostLink, setCurrentHostLink] = useState("");
  const [selectedHost, setSelectedHost] = useState(null);
  const [showTipModal, setShowTipModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileHost, setProfileHost] = useState(null);
  const [activeTab, setActiveTab] = useState("Directory");
  const [user, setUser] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    async function loadHosts() {
      const data = await fetchHosts();
      setHosts(Array.isArray(data) ? data : []);
    }
    loadHosts();
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user || null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleJoin = (host) => {
    if (!user) return alert("Please login to join the call.");
    if (host.livelink) setCurrentHostLink(host.livelink);
    else alert(`${host.name} is currently offline or has no active link.`);
  };

  const handleTip = (host) => {
    if (!user) return alert("Please login to tip a host.");
    setSelectedHost(host);
    setShowTipModal(true);
  };

  const handleViewProfile = (host) => {
    setProfileHost(host);
    setShowProfileModal(true);
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const toggleOnlineStatus = async () => {
    if (!user) return;
    setStatusLoading(true);
    try {
      const newStatus = !user.islive;
      await supabase.from("profiles").update({ islive: newStatus }).eq("email", user.email);
      setUser({ ...user, islive: newStatus });
    } catch (err) {
      console.error(err);
    } finally {
      setStatusLoading(false);
    }
  };

  const filteredHosts = hosts.filter((host) => {
    if (!searchTopic) return true; // show all if search empty
    if (!Array.isArray(host.topics)) return false;
    return host.topics.some((t) => t.toLowerCase().includes(searchTopic.toLowerCase()));
  });

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 16 }}>
      <Hero />

      <div style={{ margin: "20px 0" }}>
        <iframe
          title="Jitsi Video"
          src={currentHostLink || "https://meet.jit.si/ExampleTestRoom"}
          style={{ width: "100%", height: 400, border: "none", borderRadius: 12 }}
          allow="camera; microphone; fullscreen; display-capture"
        />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
        {["Directory", "Chat Requests", "Profile", "Referral Commission"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              backgroundColor: activeTab === tab ? "#22c55e" : "#e5e7eb",
              color: activeTab === tab ? "#fff" : "#111827",
            }}
          >
            {tab}
          </button>
        ))}

        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          {user ? (
            <>
              <div
                onClick={toggleOnlineStatus}
                style={{
                  display: "flex",
                  borderRadius: 8,
                  overflow: "hidden",
                  cursor: "pointer",
                  fontWeight: 600,
                  color: "#fff",
                }}
              >
                <div style={{ padding: "8px 12px", backgroundColor: user.islive ? "#22c55e" : "#6b7280" }}>
                  Online
                </div>
                <div style={{ padding: "8px 12px", backgroundColor: !user.islive ? "#ef4444" : "#6b7280" }}>
                  Offline
                </div>
              </div>
              <button onClick={handleLogout} style={{ padding: "8px 16px", borderRadius: 8, border: "none", backgroundColor: "#3b82f6", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
                Logout
              </button>
            </>
          ) : (
            <button onClick={handleGoogleLogin} style={{ padding: "8px 16px", borderRadius: 8, border: "none", backgroundColor: "#3b82f6", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
              Login / Sign Up
            </button>
          )}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "Directory" && (
        <>
          <TopicSearchBar value={searchTopic} onChange={setSearchTopic} />
          {filteredHosts.length > 0 ? (
            <HostCards hosts={filteredHosts} onJoin={handleJoin} onTip={handleTip} onViewProfile={handleViewProfile} />
          ) : (
            <p style={{ textAlign: "center" }}>No hosts available now.</p>
          )}
        </>
      )}

      {activeTab === "Chat Requests" && <ChatRequests />}
      {activeTab === "Profile" && <ProfileTab user={user} onLogin={handleGoogleLogin} />}
      {activeTab === "Referral Commission" && <ReferralCommisionTab user={user} onLogin={handleGoogleLogin} />}

      {showProfileModal && profileHost && <ProfileModal host={profileHost} onClose={() => setShowProfileModal(false)} onJoin={() => handleJoin(profileHost)} onTip={() => handleTip(profileHost)} />}
      {showTipModal && selectedHost && <TipHostButton host={selectedHost} onClose={() => setShowTipModal(false)} />}
    </div>
  );
}


