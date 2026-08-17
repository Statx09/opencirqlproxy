import React, { useEffect, useState, useCallback } from "react";

import HostCard from "./components/HostCard";
import DiscoveryPage from "./components/DiscoveryPage";
import GlassBar from "./components/GlassBar";
import ModalShell from "./components/ui/ModalShell";
import StatusFeedModal from "./components/StatusFeedModal";
import CallsStudioModal from "./components/CallsStudioModal";
import { useTheme } from "./context/ThemeContext";
import { Sun, Moon, Settings } from "lucide-react";
import { useUser } from "./hooks/useUser";


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

  const { login, logout } = useUser();

  const [hosts, setHosts] = useState([]);
  const [mode, setMode] = useState("grid");
  const [index, setIndex] = useState(0);
  const [showNetwork, setShowNetwork] = useState(false);
const [showSettings, setShowSettings] = useState(false);
const [notificationsEnabled, setNotificationsEnabled] = useState(true);
const [notifications, setNotifications] = useState([]);
const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const loadNotifications = useCallback(async () => {
    if (!user?.id) {
      setNotifications([]);
      setUnreadNotificationCount(0);
      return;
    }

    const { data, error } = await supabase
      .from("messages")
      .select("id, sender_id, receiver_id, text, event, payload, created_at, read_at")
      .eq("receiver_id", user.id)
      .not("event", "is", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("NOTIFICATIONS LOAD ERROR:", error);
      return;
    }

    const notificationRows = (data || []).filter(
      (item) =>
        item.event === "wave" ||
        item.event === "like" ||
        item.event === "status_like"
    );

    setNotifications(notificationRows);
    setUnreadNotificationCount(
      notificationRows.filter((item) => !item.read_at).length
    );
    }, [user?.id]);

  /* ================= UNREAD MESSAGES ================= */

const loadUnreadMessages = useCallback(async () => {
  if (!user?.id) {
    setUnreadMessageCount(0);
    return;
  }

  const { count, error } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("receiver_id", user.id)
    .is("event", null)
    .is("read_at", null);

  if (error) {
    console.error("UNREAD MESSAGES LOAD ERROR:", error);
    return;
  }

  setUnreadMessageCount(count || 0);
}, [user?.id]);

useEffect(() => {
  loadUnreadMessages();
}, [loadUnreadMessages]);

useEffect(() => {
  loadNotifications();
}, [loadNotifications]);

useEffect(() => {
  if (!user?.id) return;

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => {
          const notification = payload.new;

          if (
            notification.event !== "wave" &&
            notification.event !== "like" &&
            notification.event !== "status_like"
          ) {
            return;
          }

          setNotifications((previous) => {
            if (previous.some((item) => item.id === notification.id)) {
              return previous;
            }

            return [notification, ...previous];
          });

          if (!notification.read_at) {
            setUnreadNotificationCount((count) => count + 1);
          }
        }
      )
      .subscribe((status) => {
        console.log("NOTIFICATIONS REALTIME:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);
  /* ================= MESSAGE REALTIME ================= */

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`messages-unread-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => {
          const message = payload.new;

          if (message.event !== null) {
            return;
          }

          if (!message.read_at) {
            loadUnreadMessages();
          }
        }
      )
      .subscribe((status) => {
        console.log("MESSAGES REALTIME:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);
  const markNotificationsRead = useCallback(async () => {
    if (!user?.id) return;

    const { error } = await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("receiver_id", user.id)
      .is("read_at", null)
      .in("event", ["wave", "like", "status_like"]);

    if (error) {
      console.error("NOTIFICATIONS READ ERROR:", error);
      return;
    }

    setNotifications((previous) =>
      previous.map((notification) => ({
        ...notification,
        read_at: notification.read_at || new Date().toISOString(),
      }))
    );

    setUnreadNotificationCount(0);
  }, [user?.id]);
const [networkView, setNetworkView] = useState("main");

  const markMessagesRead = useCallback(
    async (otherUserId) => {
      if (!user?.id || !otherUserId) return;

      const { error } = await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("receiver_id", user.id)
        .eq("sender_id", otherUserId)
        .is("event", null)
        .is("read_at", null);

      if (error) {
        console.error("MESSAGES READ ERROR:", error);
        return;
      }

      await loadUnreadMessages();
    },
    [user?.id, loadUnreadMessages]
  );


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

const handleNotificationClick = useCallback(
  async (notification) => {
    console.log(
      "NOTIFICATION CLICK:",
      notification?.event,
      notification?.sender_id
    );

    if (!notification?.sender_id) return;

    const { data: senderProfile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", notification.sender_id)
      .maybeSingle();

    console.log("NOTIFICATION SENDER PROFILE:", senderProfile);
    console.log("NOTIFICATION SENDER ERROR:", error);

    if (error || !senderProfile) {
      console.log("Notification sender profile not found.");
      return;
    }

    if (
      notification.event === "wave" ||
      notification.event === "like" ||
      notification.event === "status_like"
    ) {
      setSelectedHost(null);
      setSelectedProfile(senderProfile);
      setActiveModal("profile");
      return;
    }

    if (notification.event === "message") {
      setSelectedProfile(null);
      setSelectedHost(senderProfile);
      setActiveModal("messages");
      return;
    }
  },
  []
);



const [showStatusModal, setShowStatusModal] = useState(false);

const { statuses, reload: reloadStatuses } = useStatusFeed();

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
  await markMessagesRead(host?.user_id ?? host?.id);
  setActiveModal("messages");
  break;

        case "chats":
          setActiveModal("chats");
          break;

        case "notifications":
          setActiveModal("notifications");
          break;

        case "status":
         setShowStatusModal(true);
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

        case "statusLike": {
          const receiverId = host?.user_id;

          if (!receiverId || !user?.id) return;

          if (receiverId === user.id) {
            console.log("IGNORING SELF STATUS LIKE");
            return;
          }

          const likerName =
            user?.user_metadata?.name ||
            user?.user_metadata?.full_name ||
            user?.email ||
            "Someone";

          await supabase.from("messages").insert({
            sender_id: user.id,
            receiver_id: receiverId,
            text: `${likerName} liked your post`,
            event: "status_like",
            created_at: new Date().toISOString(),
          });

          break;
        }

        case "wave":
        case "like":
        case "support": {
          const receiverId = host?.user_id;
          if (!receiverId || !user?.id) return;

          if (receiverId === user.id) {
            console.log("IGNORING SELF ACTION:", type);
            return;
          }

          if (type === "support") {
            setSelectedHost(host);
            setActiveModal("sayThanks");
            return;
          }

          const text =
            type === "wave"
              ? "waved at you"
              : "liked you";

          await supabase.from("messages").insert({
            sender_id: user.id,
            receiver_id: receiverId,
            text,
            event: type,
            created_at: new Date().toISOString(),
          });


          break;
        }

        default:
          console.log("UNKNOWN ACTION:", type);
      }
    },
    [user, current, next, prev, markNotificationsRead, markMessagesRead]
  );

  if (!hasHosts) {
    return <div style={{ color: "#fff", padding: 20 }}>Loading...</div>;
  }

  return (
  <div style={page(theme)}>

{mode === "grid" && (
  <div style={{ ...header(theme), position: "relative" }}>

   <div style={networkWrap}>
  <button
    type="button"
    style={networkButton}
    onClick={() => setShowNetwork((v) => !v)}
    aria-label="Cirql Network"
  >
    <span style={networkSignal}>
      <span style={networkSignalArc1}></span>
      <span style={networkSignalArc2}></span>
      <span style={networkSignalDot}></span>
    </span>
  </button>

  {showNetwork && (
  <div style={networkDropdown(theme)}>
    {networkView === "main" ? (
      <>
        <div style={networkDropdownHeader}>
          <span style={networkDot}></span>
          <span>Cirql Network</span>
        </div>

        <div style={networkHealth}>
          <div>
            <div style={networkHealthLabel}>
              Network health
            </div>

            <div style={networkBars}>
              <span style={{ ...networkBar, height: 5 }}></span>
              <span style={{ ...networkBar, height: 9 }}></span>
              <span style={{ ...networkBar, height: 13 }}></span>
              <span style={{ ...networkBar, height: 17 }}></span>
              <span style={{ ...networkBar, height: 21 }}></span>
            </div>
          </div>

          <div style={networkPercent}>94%</div>
        </div>

        <div style={networkStats}>
          <div style={networkStat}>
            <strong>1,284</strong>
            <span>members</span>
          </div>

          <div style={networkStat}>
            <strong>342</strong>
            <span>hosts</span>
          </div>

          <div style={networkStat}>
            <strong>86</strong>
            <span>online</span>
          </div>
        </div>

        <div style={networkDivider}></div>

        <button
          type="button"
          style={networkTransparency}
          onClick={() => setNetworkView("transparency")}
        >
          <span>Network costs</span>
          <span>&rarr;</span>
        </button>

        <button
          type="button"
          style={networkFund}
          aria-label="Contribute"
        >
          Contribute
        </button>

        <div style={networkDivider}></div>

        <div style={networkTransparencyMessage}>
          Cirql is built to keep the network available,
          independent, and accessible.
        </div>
      </>
    ) : (
      <>
        <button
          type="button"
          style={networkBack}
          onClick={() => setNetworkView("main")}
        >
          <span>??</span>
          <span>Cirql Network</span>
        </button>

        <div style={networkTransparencyTitle}>
          Network costs
        </div>

        <div style={networkTransparencySubtitle}>
          Monthly network target
        </div>

        <div style={networkMonthlyTarget}>
          $1,500
          <span>/ month</span>
        </div>

        <div style={networkCosts}>
          <div style={networkCostRow}>
            <span>Infrastructure</span>
            <strong>$600</strong>
          </div>

          <div style={networkCostRow}>
            <span>Storage & data</span>
            <strong>$200</strong>
          </div>

          <div style={networkCostRow}>
            <span>Calls & video</span>
            <strong>$400</strong>
          </div>

          <div style={networkCostRow}>
            <span>Security & services</span>
            <strong>$300</strong>
          </div>
        </div>

        <div style={networkDivider}></div>

        <button
          type="button"
          style={networkFund}
          aria-label="Contribute"
        >
          Contribute
        </button>

        <div style={networkDivider}></div>

        <div style={networkTransparencyMessage}>
          Cirql is built to keep the network available,
          independent, and accessible.
        </div>
      </>
    )}
  </div>
)}

</div>
<div style={brandWrap}>
      <div style={brandName}>
        Cirql
      </div>

      <div
        style={{
          color: theme.text,
          opacity: 0.35,         

 fontSize: 13,
          marginTop: 1,
        }}
      >
        &bull;
      </div>

      <div style={brandTagline}>
        Social & Support Discovery
      </div>
    </div>

    <div style={headerActions}><div style={settingsWrap}><button type="button" style={settingsButton(theme)} onClick={() => setShowSettings((v) => !v)} aria-label="Settings"><Settings size={17} strokeWidth={2} /></button>{showSettings && (<div style={settingsDropdown(theme)}><div style={settingsSection}><div style={settingsLabel}>Appearance</div><button type="button" style={settingsRow(theme)} onClick={toggleTheme}><span style={settingsRowLeft}>{theme.mode === "dark" ? (<Moon size={15} strokeWidth={2} />) : (<Sun size={15} strokeWidth={2} />)}<span>{theme.mode === "dark" ? "Dark mode" : "Light mode"}</span></span><span style={settingsValue}>{theme.mode === "dark" ? "Dark" : "Light"}</span></button></div><div style={settingsDivider}></div><div style={settingsSection}><div style={settingsLabel}>Notifications</div><button type="button" style={settingsRow(theme)} onClick={() => setNotificationsEnabled((v) => !v)}><span style={settingsRowLeft}><span style={{...settingsBell, background: notificationsEnabled ? "#22c55e" : "rgba(148,163,184,.35)"}}></span><span>Notifications</span></span><span style={{...settingsSwitch, background: notificationsEnabled ? "#22c55e" : "rgba(148,163,184,.22)"}}><span style={{...settingsSwitchKnob, transform: notificationsEnabled ? "translateX(14px)" : "translateX(2px)"}} /></span></button></div><div style={settingsDivider}></div><button type="button" style={settingsLogout} onClick={async () => { setShowSettings(false); await logout(); }}>Log out</button></div>)}</div>

    </div>

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
      ? Grid View
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
        <GlassBar
  user={user}
  onAction={handleAction}
  unreadNotificationCount={unreadNotificationCount}
  unreadMessageCount={unreadMessageCount}
/>
      </div>

      {/* STATUS MODAL */}
{showStatusModal && (
  <StatusFeedModal
  statuses={statuses}
  user={user}
  onClose={() => setShowStatusModal(false)}
  onOpenProfile={handleOpenProfile}
  onAction={handleAction}
  reloadStatuses={reloadStatuses}
/>
)}

      {/* MODALS */}

      {activeModal === "profile" && (selectedHost || selectedProfile) && (
  <>
    {console.log("SELECTED HOST:", selectedHost)}
    {console.log("SELECTED PROFILE:", selectedProfile)}

    <div style={{ position: "fixed", inset: 0, zIndex: 100001 }}>
      <ProfileModal
        host={
          selectedHost
            ? selectedHost
            : selectedProfile
        }
        onClose={closeModal}
      />
    </div>
  </>
)}

      {activeModal === "userProfile" && (
        <ModalShell title="Identity Studio" onClose={closeModal}>
          <ProfileTab
  user={user}
  onLogout={async () => {
    await supabase.auth.signOut();
    closeModal();
  }}
/>
        </ModalShell>
      )}

      {activeModal === "messages" && selectedHost && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100002 }}>
          <MessagesModal
            host={selectedHost}
            user={user}
            onClose={closeModal}
            onMessagesRead={loadUnreadMessages}
          />
        </div>
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
          <NotificationsModal notifications={notifications} onNotificationClick={handleNotificationClick} />
        </ModalShell>
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

const settingsWrap = {
  position: "relative",
};

const settingsButton = (theme) => ({
  width: 32,
  height: 32,
  borderRadius: "50%",
  border: `1px solid ${theme.border}`,
  background: "transparent",
  color: theme.text,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
});

const settingsDropdown = (theme) => ({
  position: "absolute",
  top: 40,
  right: 0,
  width: 210,
  padding: 10,
  borderRadius: 14,
  background: theme.mode === "dark" ? "rgba(15,23,42,.96)" : "rgba(248,250,252,.96)",
  border: "1px solid rgba(148,163,184,.18)",
  boxShadow: "0 18px 45px rgba(0,0,0,.28)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  zIndex: 100,
  boxSizing: "border-box",
});

const settingsSection = {
  padding: "3px 2px",
};

const settingsLabel = {
  fontSize: 10,
  fontWeight: 600,
  opacity: 0.42,
  marginBottom: 5,
  padding: "0 7px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const settingsRow = (theme) => ({
  width: "100%",
  minHeight: 32,
  padding: "0 7px",
  border: "none",
  borderRadius: 7,
  background: "transparent",
  color: theme.text,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  cursor: "pointer",
  fontSize: 12,
});

const settingsRowLeft = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const settingsValue = {
  fontSize: 10,
  opacity: 0.42,
};

const settingsBell = {
  width: 7,
  height: 7,
  borderRadius: "50%",
  background: "#22c55e",
};

const settingsSwitch = {
  position: "relative",
  width: 28,
  height: 16,
  borderRadius: 999,
  transition: "background .2s ease",
};

const settingsSwitchKnob = {
  position: "absolute",
  top: 2,
  left: 0,
  width: 12,
  height: 12,
  borderRadius: "50%",
  background: "#fff",
  transition: "transform .2s ease",
};

const settingsDivider = {
  height: 1,
  margin: "7px 2px",
  background: "rgba(148,163,184,.12)",
};

const settingsLogout = {
  width: "100%",
  height: 32,
  border: "none",
  borderRadius: 8,
  background: "transparent",
  color: "rgba(248,113,113,.82)",
  textAlign: "left",
  padding: "0 9px",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};
const networkButton = {
  position: "absolute",
  left: 12,
  top: "50%",
  transform: "translateY(-50%)",
  width: 32,
  height: 32,
  borderRadius: "50%",
  border: "1px solid #4b5563",
  background: "transparent",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

const networkWrap = {
  position: "absolute",
  left: 12,
  top: "50%",
  transform: "translateY(-50%)",
};

const networkSignal = {
  position: "relative",
  width: 20,
  height: 20,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const networkSignalArc1 = {
  position: "absolute",
  width: 10,
  height: 10,
  border: "1.5px solid currentColor",
  borderLeftColor: "transparent",
  borderBottomColor: "transparent",
  borderRadius: "50%",
  transform: "rotate(-45deg)",
  opacity: 0.75,
};

const networkSignalArc2 = {
  position: "absolute",
  width: 17,
  height: 17,
  border: "1.5px solid currentColor",
  borderLeftColor: "transparent",
  borderBottomColor: "transparent",
  borderRadius: "50%",
  transform: "rotate(-45deg)",
  opacity: 0.35,
};

const networkSignalDot = {
  width: 6,
  height: 6,
  borderRadius: "50%",
  background: "#22c55e",
  boxShadow: "0 0 0 3px rgba(34,197,94,.15)",
  zIndex: 2,
};

const networkDot = {
  width: 7,
  height: 7,
  borderRadius: "50%",
  background: "#22c55e",
  boxShadow: "0 0 0 3px rgba(34,197,94,.15)",
  flexShrink: 0,
};

const networkDropdown = (theme) => ({
  position: "absolute",
  top: 40,
  left: 0,
  width: 228,
  padding: 16,
  borderRadius: 16,
  background: theme.mode === "dark" ? "rgba(15,23,42,.96)" : "rgba(248,250,252,.96)",
  border: "1px solid rgba(148,163,184,.18)",
  boxShadow: "0 18px 45px rgba(0,0,0,.28)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  zIndex: 100,
  boxSizing: "border-box",
});

const networkDropdownHeader = {
  display: "flex",
  alignItems: "center",
  gap: 9,
  fontSize: 13,
  fontWeight: 700,
};

const networkHealth = {
  marginTop: 18,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const networkBars = {
  display: "flex",
  alignItems: "flex-end",
  gap: 4,
  height: 22,
};

const networkPercent = {
  fontSize: 20,
  fontWeight: 800,
  letterSpacing: "-0.5px",
};

const networkStats = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 8,
  marginTop: 18,
  textAlign: "center",
};

const networkStat = {
  display: "flex",
  flexDirection: "column",
  gap: 3,
  fontSize: 11,
  opacity: 0.7,
};

const networkDivider = {
  height: 1,
  margin: "16px 0 12px",
  background: "rgba(148,163,184,.12)",
};

const networkFund = {
  width: "100%",
  height: 30,
  padding: "0 12px",
  borderRadius: 8,
  border: "1px solid rgba(148,163,184,.18)",
  background: "rgba(255,255,255,.035)",
  color: "inherit",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 11,
  fontWeight: 650,
  letterSpacing: "0.1px",
  cursor: "pointer",
  transition: "all .2s ease",
};

const networkSupportIntro = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
  marginBottom: 12,
  fontSize: 11,
  lineHeight: 1.45,
  opacity: 0.65,
};

const networkTransparency = {
  width: "100%",
  marginTop: 8,
  padding: "7px 2px",
  border: "none",
  background: "transparent",
  color: "inherit",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  fontSize: 11,
  opacity: 0.58,
  cursor: "pointer",
};

const networkBack = {
  width: "100%",
  border: "none",
  background: "transparent",
  color: "inherit",
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: 0,
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
};

const networkTransparencyTitle = {
  marginTop: 20,
  fontSize: 17,
  fontWeight: 800,
  letterSpacing: "-0.3px",
};

const networkTransparencySubtitle = {
  marginTop: 4,
  fontSize: 11,
  opacity: 0.5,
};

const networkMonthlyTarget = {
  marginTop: 8,
  fontSize: 25,
  fontWeight: 800,
  letterSpacing: "-0.7px",
};

const networkCosts = {
  marginTop: 20,
  display: "flex",
  flexDirection: "column",
  gap: 13,
};

const networkCostRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontSize: 12,
  opacity: 0.75,
};

const networkTransparencyMessage = {
  marginTop: 20,
  paddingTop: 14,
  borderTop: "1px solid rgba(148,163,184,.12)",
  fontSize: 11,
  lineHeight: 1.5,
  opacity: 0.55,
};

const networkHealthLabel = {
  fontSize: 10,
  fontWeight: 600,
  opacity: 0.55,
  marginBottom: 7,
  letterSpacing: "0.2px",
};

const networkBar = {
  width: 7,
  borderRadius: 3,
  background: "#22c55e",
  opacity: 0.85,
};

const brandWrap = {
  position: "absolute",
  left: "50%",
  top: "50%",
  transform: "translate(-50%, -50%)",
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const brandLogo = {
  width: 30,
  height: 30,
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const brandName = {
  fontSize: 20,
  fontWeight: 800,
  letterSpacing: "-0.4px",
  color: "inherit",
  lineHeight: 1,
};

const brandTagline = {
  marginTop: 2,
  fontSize: 12,
  fontWeight: 600,
  fontStyle: "italic",
  fontFamily: '"Trebuchet MS", "Segoe UI", sans-serif',
  letterSpacing: "0.1px",
  color: "inherit",
  opacity: 0.62,
  lineHeight: 1,
};

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

  background: theme.mode === "dark" ? "rgba(15,23,42,.96)" : "rgba(248,250,252,.96)",
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
  width: "100%",
  height: 40,
  padding: "0 14px",

  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  borderRadius: 10,
  border: "1px solid rgba(255,255,255,.12)",

  background: "rgba(20,20,25,.72)",
  color: "#fff",

  fontWeight: 600,
  fontSize: 13,

  cursor: "pointer",

  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",

  boxSizing: "border-box",
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

const headerActions = {
  position: "absolute",
  right: 12,
  top: "50%",
  transform: "translateY(-50%)",
  display: "flex",
  alignItems: "center",
  gap: 8,
};










































