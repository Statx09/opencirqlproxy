import React, { useState, useEffect } from "react";
import Hero from "./Hero.jsx";
import HostCards from "./HostCards.jsx";
import TipHostButton from "./TipHostButton.jsx";
import ChatRequests from "./ChatRequests.jsx";
import TopicSearchBar from "./TopicSearchBar.jsx";
import ProfileTab from "./ProfileTab.jsx";
import ReferralCommisionTab from "./ReferralCommisionTab.jsx";
import { supabase } from "./supabaseClient.js";
import { fetchHosts } from "./fetchHosts.js";

export default function LandingPage() {
  const [hosts, setHosts] = useState([]);
  const [searchTopic, setSearchTopic] = useState("");
  const [currentHostLink, setCurrentHostLink] = useState("");
  const [showTipModal, setShowTipModal] = useState(false);
  const [selectedHost, setSelectedHost] = useState(null);
  const [activeTab, setActiveTab] = useState("Directory");
  const [user, setUser] = useState(null);

  // Load hosts from Supabase
  useEffect(() => {
    async function loadHosts() {
      try {
        const data = await fetchHosts();
        if (Array.isArray(data)) setHosts(data);
      } catch (err) {
        console.error("Error loading hosts:", err);
      }
    }
    loadHosts();
  }, []);

  // Supabase auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user || null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleJoin = (host) => {
    if (!user) {
      alert("Please login to join the call.");
      return;
    }
    if (host.livelink) {
      setCurrentHostLink(host.livelink);
    } else {
      alert(`${host.name} is currently offline or has no active link.`);
    }
  };

  const handleMessage = (host) => {
    if (!user) {
      alert("Please login to send a message.");
      return;
    }
    alert(`Messaging ${host.name}... (feature to be implemented)`);
  };

  const handleTip = (host) => {
    if (!user) {
      alert("Please login to tip a host.");
      return;
    }
    setSelectedHost(host);
    setShowTipModal(true);
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) console.error("Google login error:", error);
  };

  // Filter hosts by search topic
  const filteredHosts = hosts.filter((host) =>
    host.topics?.toLowerCase().includes(searchTopic.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 16 }}>
      <Hero />

      {/* Jitsi embed */}
      <div style={{ margin: "20px 0" }}>
        <iframe
          title="Jitsi Video"
          src={currentHostLink || "https://meet.jit.si/ExampleTestRoom"}
          style={{ width: "100%", height: 400, border: "none", borderRadius: 12 }}
          allow="camera; microphone; fullscreen; display-capture"
        />
      </div>

      {/* Tabs + login/profile */}
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
              transition: "all 0.2s",
            }}
          >
            {tab}
          </button>
        ))}

        {!user && (
          <button
            onClick={handleGoogleLogin}
            style={{
              marginLeft: "auto",
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              backgroundColor: "#3b82f6",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Login / Sign Up
          </button>
        )}
      </div>

      {/* Tab content */}
      {activeTab === "Directory" && (
        <>
          {/* Topic search bar with dropdown suggestions */}
          <TopicSearchBar value={searchTopic} onChange={setSearchTopic} />

          {/* Host cards filtered by topic */}
          {filteredHosts.length > 0 ? (
            <HostCards
              hosts={filteredHosts}
              onJoin={handleJoin}
              onMessage={handleMessage}
              onTip={handleTip}
            />
          ) : (
            <p style={{ textAlign: "center" }}>No hosts available now.</p>
          )}
        </>
      )}

      {activeTab === "Chat Requests" && <ChatRequests />}

      {activeTab === "Profile" && <ProfileTab user={user} onLogin={handleGoogleLogin} />}

      {activeTab === "Referral Commission" && (
        <ReferralCommisionTab user={user} onLogin={handleGoogleLogin} />
      )}

      {/* Tip modal */}
      {showTipModal && selectedHost && (
        <TipHostButton host={selectedHost} onClose={() => setShowTipModal(false)} />
      )}
    </div>
  );
}

