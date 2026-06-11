import React, { useEffect, useState } from "react";

import HostCard from "./components/HostCard";
import ProfileModal from "./components/ProfileModal";
import DiscoveryExplorerModal from "./components/DiscoveryExplorerModal";
import ChatsTab from "./components/ChatsTab";
import ConnectionsTab from "./components/ConnectionsTab";
import ProfileTab from "./components/ProfileTab";

import { supabase } from "./lib/supabaseClient";
import { fetchHosts } from "./api/fetchHosts";
import { getSuggestedHost } from "./lib/matchEngine";

export default function LandingPage() {
  const [hosts, setHosts] = useState([]);
  const [user, setUser] = useState(null);

  const [index, setIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("Discover");
  const [selectedHost, setSelectedHost] = useState(null);

  const [explorerOpen, setExplorerOpen] = useState(false);
  const [suggestedMatch, setSuggestedMatch] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user || null);
    });
  }, []);

  useEffect(() => {
    fetchHosts().then(setHosts);
  }, []);

  useEffect(() => {
    if (!hosts.length) return;
    setSuggestedMatch(getSuggestedHost(hosts, user));
  }, [hosts, user]);

  const current = hosts[index];

  const next = () => setIndex((i) => (i + 1) % hosts.length);
  const prev = () => setIndex((i) => (i - 1 + hosts.length) % hosts.length);

  return (
    <div style={page}>

      {/* FULL CARD MODE */}
      {activeTab === "Discover" && current && (
        <div style={wrap}>
          <HostCard
  host={current}
  user={user}
  hasProfile={!!user}
  onViewProfile={() => setSelectedHost(current)}
  onOpenExplorer={() => setExplorerOpen(true)}
/>
        </div>
      )}

      {/* TAB BAR */}
      <div style={tabs}>
        <button onClick={() => setActiveTab("Discover")}>🔥</button>
        <button onClick={() => setActiveTab("Chats")}>💬</button>
        <button onClick={() => setActiveTab("Connections")}>👥</button>
        <button onClick={() => setActiveTab("Profile")}>👤</button>
      </div>

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
        <ProfileModal host={selectedHost} onClose={() => setSelectedHost(null)} />
      )}

      {activeTab === "Chats" && <ChatsTab user={user} hosts={hosts} />}
      {activeTab === "Connections" && <ConnectionsTab user={user} />}
      {activeTab === "Profile" && <ProfileTab user={user} />}
    </div>
  );
}

const page = {
  height: "100vh",
  background: "#0b1220",
  display: "flex",
  flexDirection: "column",
};

const wrap = {
  flex: 1,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const tabs = {
  height: 60,
  display: "flex",
  justifyContent: "space-around",
  alignItems: "center",
  background: "#111827",
  color: "#fff",
};