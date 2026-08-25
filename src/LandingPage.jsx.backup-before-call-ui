import React, { useEffect, useState, useCallback } from "react";

import HostCard from "./components/HostCard";
import DiscoveryPage from "./components/DiscoveryPage";
import GlassBar from "./components/GlassBar";
import ModalShell from "./components/ui/ModalShell";
import StatusFeedModal from "./components/StatusFeedModal";
import CallsStudioModal from "./components/CallsStudioModal";
import { useTheme } from "./context/ThemeContext";
import { Grid3X3,  Sun, Moon, Settings } from "lucide-react";
import { useUser } from "./hooks/useUser";


import ChatsTab from "./components/ChatsTab";
import MessagesModal from "./components/MessagesModal";
import NotificationsModal from "./components/NotificationsModal";
import ConnectionsContent from "./components/ConnectionsContent";
import SayThanksModal from "./components/SayThanksModal";
import ProfileModal from "./components/ProfileModal";
import ProfileTab from "./components/ProfileTab/ProfileTab";

import { fetchHosts } from "./api/fetchHosts";
import { useSwipe } from "./hooks/useSwipe";
import useStatusFeed from "./hooks/useStatusFeed";
import { supabase } from "./lib/supabaseClient";


export default function LandingPage({ user }) {

  const { user: authUser, login, logout } = useUser();

  console.log("SETTINGS AUTH STATE:", {
    authUser,
    authUserId: authUser?.id || null,
  });

  const [hosts, setHosts] = useState([]);
  const [mode, setMode] = useState("grid");
  const [index, setIndex] = useState(0);
  const [showNetwork, setShowNetwork] = useState(false);
const [showSettings, setShowSettings] = useState(false);
const [notificationsEnabled, setNotificationsEnabled] = useState(true);
const [notificationSettings, setNotificationSettings] = useState({
  messages: true,
  voiceCalls: true,
  videoCalls: true,
  connections: true,
});
const [notifications, setNotifications] = useState([]);
const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
const [unreadMessageCount, setUnreadMessageCount] = useState(0);
const [unreadConnectionRequestCount, setUnreadConnectionRequestCount] = useState(0);

/* ================= INCOMING CALL ================= */

const [incomingCall, setIncomingCall] = useState(null);
const [outgoingCall, setOutgoingCall] = useState(null);

  const loadNotifications = useCallback(async () => {
    if (!user?.id) {
      setNotifications([]);
      setUnreadNotificationCount(0);
      return;
    }

    const { data, error } = await supabase
      .from("messages")
      .select(
        "id, sender_id, receiver_id, text, event, payload, created_at, read_at"
      )
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

    const senderIds = [
      ...new Set(
        notificationRows
          .map((item) => item.sender_id)
          .filter(Boolean)
      ),
    ];

    console.log("NOTIFICATION DEBUG - rows:", notificationRows);
    console.log("NOTIFICATION DEBUG - senderIds:", senderIds);

    let profilesByUserId = {};

    if (senderIds.length > 0) {
      const {
        data: profiles,
        error: profilesError,
      } = await supabase
        .from("profiles")
        .select(
          "user_id, name, alias, avatar, avatar_url"
        )
        .in("user_id", senderIds);

      if (profilesError) {
        console.error(
          "NOTIFICATION PROFILES LOAD ERROR:",
          profilesError
        );
      } else {
        console.log("NOTIFICATION DEBUG - profiles returned:", profiles);
        console.log(
          "NOTIFICATION DEBUG - profile user_ids:",
          (profiles || []).map((profile) => profile.user_id)
        );

        profilesByUserId = (profiles || []).reduce(
          (map, profile) => {
            map[profile.user_id] = profile;
            return map;
          },
          {}
        );
      }
    }

    const enrichedNotifications =
      notificationRows.map((notification) => ({
        ...notification,
        sender_profile:
          profilesByUserId[notification.sender_id] || null,
      }));

    setNotifications(enrichedNotifications);

    setUnreadNotificationCount(
      enrichedNotifications.filter(
        (item) => !item.read_at
      ).length
    );
  }, [user?.id]);
  /* ================= UNREAD CONNECTION REQUESTS ================= */

const loadUnreadConnectionRequests = useCallback(async () => {
  if (!user?.id) {
    setUnreadConnectionRequestCount(0);
    return;
  }

  const { count, error } = await supabase
    .from("connections")
    .select("id", { count: "exact", head: true })
    .eq("user_b", user.id)
    .eq("status", "pending");

  if (error) {
    console.error("UNREAD CONNECTION REQUESTS LOAD ERROR:", error);
    return;
  }

  setUnreadConnectionRequestCount(count || 0);
}, [user?.id]);

useEffect(() => {
  loadUnreadConnectionRequests();
}, [loadUnreadConnectionRequests]);

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
        async (payload) => {
          const notification = payload.new;

          if (
            notification.event !== "wave" &&
            notification.event !== "like" &&
            notification.event !== "status_like"
          ) {
            return;
          }

          let senderProfile = null;

          if (notification.sender_id) {
            const { data, error } = await supabase
              .from("profiles")
              .select(
                "user_id, name, alias, avatar, avatar_url"
              )
              .eq("user_id", notification.sender_id)
              .maybeSingle();

            if (error) {
              console.error(
                "REALTIME NOTIFICATION PROFILE ERROR:",
                error
              );
            } else {
              senderProfile = data || null;
            }
          }

          const enrichedNotification = {
            ...notification,
            sender_profile: senderProfile,
          };

          setNotifications((previous) => {
            if (
              previous.some(
                (item) => item.id === enrichedNotification.id
              )
            ) {
              return previous;
            }

            return [enrichedNotification, ...previous];
          });

          if (!notification.read_at) {
            loadNotifications();
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
  /* ================= CONNECTION REQUEST REALTIME ================= */

useEffect(() => {
  if (!user?.id) return;

  const channel = supabase
    .channel(`connection-requests-${user.id}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "connections",
        filter: `user_b=eq.${user.id}`,
      },
      (payload) => {
        const connection = payload.new;

        if (connection.status !== "pending") {
          return;
        }

        loadUnreadConnectionRequests();
      }
    )
    .subscribe((status) => {
console.log("CONNECTION REQUESTS REALTIME:", status);
    });

  return () => {
    supabase.removeChannel(channel);
  };
}, [user?.id, loadUnreadConnectionRequests]);

/* ================= INCOMING / CALL ACCEPTED REALTIME ================= */

  useEffect(() => {
    console.log("CALL REALTIME EFFECT STARTED:", user?.id);
if (!user?.id) {
      console.log("CALL REALTIME EFFECT: NO USER ID");
      return;
    }

    const channel = supabase
      .channel(`call-signals-${user.id}`)

      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${user.id}`,
        },
        async (payload) => {
          const message = payload.new;
          console.log("CALL REALTIME MESSAGE RECEIVED:", {
            id: message.id,
            sender_id: message.sender_id,
            receiver_id: message.receiver_id,
            event: message.event,
            text: message.text,
          });

          if (message.event === "call_accepted") {
            console.log(
              "CALL ACCEPTED REALTIME — OPENING CALL STUDIO:",
              message
            );

            setOutgoingCall(null);
            setSelectedProfile(null);
            setActiveModal("callsStudio");

            return;
          }

          if (message.event !== "incoming_call") {
            return;
          }

          if (!message.sender_id) {
            console.warn(
              "INCOMING CALL: missing sender_id",
              message
            );
            return;
          }

          console.log("INCOMING CALL:", message);

          const { data: callerProfile, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", message.sender_id)
            .maybeSingle();

          if (error) {
            console.error(
              "INCOMING CALL PROFILE ERROR:",
              error
            );
          }

          console.log("INCOMING CALL: ABOUT TO SET STATE", {
            message,
            callerProfile,
          });

          setIncomingCall({
            ...message,
            callerProfile: callerProfile || null,
          });

          console.log("INCOMING CALL: STATE SET REQUESTED");
        }
      )
      .subscribe((status) => {
console.log(
          "CALL REALTIME STATUS:",
          status
        );

        if (status === "SUBSCRIBED") {
          console.log(
            "CALL REALTIME SUBSCRIBED SUCCESSFULLY:",
            user.id
          );
        }

        if (status === "CHANNEL_ERROR") {
          console.error(
            "CALL REALTIME ERROR: CHANNEL_ERROR"
          );
        }

        if (status === "TIMED_OUT") {
          console.error(
            "CALL REALTIME ERROR: TIMED_OUT"
          );
        }

        if (status === "CLOSED") {
          console.warn(
            "CALL REALTIME CLOSED"
          );
        }
      });

    return () => {
      console.log(
        "CALL REALTIME CLEANUP:",
        user.id
      );

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

    /* ================= MARK THIS NOTIFICATION READ ================= */

    if (!notification.read_at) {
      const { error: readError } = await supabase
        .from("messages")
        .update({
          read_at: new Date().toISOString(),
        })
        .eq("id", notification.id)
        .eq("receiver_id", user.id)
        .is("read_at", null);

      if (readError) {
        console.error(
          "NOTIFICATION READ ERROR:",
          readError
        );
      } else {
        setNotifications((previous) =>
          previous.map((item) =>
            item.id === notification.id
              ? {
                  ...item,
                  read_at: new Date().toISOString(),
                }
              : item
          )
        );

        await loadNotifications();
      }
    }

    /* ================= LOAD SENDER PROFILE ================= */

    const { data: senderProfile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", notification.sender_id)
      .maybeSingle();

    console.log(
      "NOTIFICATION SENDER PROFILE:",
      senderProfile
    );

    console.log(
      "NOTIFICATION SENDER ERROR:",
      error
    );

    if (error || !senderProfile) {
      console.log(
        "Notification sender profile not found."
      );
      return;
    }

    /* ================= OPEN SENDER PROFILE ================= */

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

    /* ================= MESSAGE ================= */

    if (notification.event === "message") {
      setSelectedProfile(null);
      setSelectedHost(senderProfile);
      setActiveModal("messages");
      return;
    }
  },
  [user?.id, loadNotifications]
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

        case "call": {
          const callTarget = host || current;

          console.log("CALL BUTTON PRESSED:", {
            userId: user?.id,
            callTarget,
            callTargetId: callTarget?.id,
            callTargetUserId: callTarget?.user_id,
          });

          if (!callTarget?.user_id || !user?.id) {
            console.error("CALL: missing caller or receiver", {
              userId: user?.id,
              callTarget,
            });
            return;
          }

          if (callTarget.user_id === user.id) {
            console.log("CALL: ignoring self-call");
            return;
          }

          const callerName =
            user?.user_metadata?.name ||
            user?.user_metadata?.full_name ||
            user?.email ||
            "Someone";

          console.log("CALL: inserting signal", {
            sender_id: user.id,
            receiver_id: callTarget.user_id,
            event: "incoming_call",
          });

          const { data: callSignalData, error: callSignalError } = await supabase
            .from("messages")
            .insert({
              sender_id: user.id,
              receiver_id: callTarget.user_id,
              text: `${callerName} is calling you`,
              private: true,
              event: "incoming_call",
              payload: {
                call_type: callTarget.callType || "video",
              },
              created_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (callSignalError) {
            console.error(
              "CALL SIGNAL ERROR:",
              callSignalError
            );
            return;
          }

          console.log(
            "CALL SIGNAL INSERTED:",
            callSignalData
          );

          if (callSignalError) {
            console.error(
              "CALL SIGNAL ERROR:",
              callSignalError
            );
            return;
          }

          console.log(
            "CALL SIGNAL SENT:",
            callTarget.user_id
          );

          setSelectedHost(callTarget);
setOutgoingCall({
  ...callTarget,
  callerName,
});

console.log(
  "CALL: waiting for recipient to answer",
  callTarget.user_id
);
          break;
        }

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

        case "connect": {
          const receiverId = host?.user_id;

          if (!receiverId || !user?.id) {
            console.error("CONNECT: missing user or receiver", {
              userId: user?.id,
              receiverId,
              host,
            });
            return;
          }

          if (receiverId === user.id) {
            console.log("CONNECT: ignoring self");
            return;
          }

          console.log("CONNECT CHECK:", {
            currentUser: user.id,
            receiverId,
          });

          const { data: existing, error: checkError } = await supabase
            .from("connections")
            .select("id, user_a, user_b, status")
            .or(
              `and(user_a.eq.${user.id},user_b.eq.${receiverId}),and(user_a.eq.${receiverId},user_b.eq.${user.id})`
            );

          if (checkError) {
            console.error("CONNECT CHECK ERROR:", checkError);
            alert("Unable to check connection.");
            return;
          }

          console.log("CONNECT EXISTING ROWS:", existing);

          if (existing?.length) {
            const accepted = existing.find(
              (connection) => connection.status === "accepted"
            );

            if (accepted) {
              console.log("CONNECT RESULT: ACCEPTED", accepted);
              alert("You are already connected.");
              return;
            }

            const outgoing = existing.find(
              (connection) =>
                connection.status === "pending" &&
                connection.user_a === user.id &&
                connection.user_b === receiverId
            );

            if (outgoing) {
              console.log("CONNECT RESULT: OUTGOING PENDING", outgoing);
              alert("Connection request already sent.");
              return;
            }

            const incoming = existing.find(
              (connection) =>
                connection.status === "pending" &&
                connection.user_a === receiverId &&
                connection.user_b === user.id
            );

            if (incoming) {
              console.log("CONNECT RESULT: INCOMING PENDING", incoming);
              alert("This person has already sent you a connection request.");
              return;
            }
          }

          console.log("CONNECT RESULT: NO EXISTING RELATION — INSERTING PENDING");
          const { error: insertError } = await supabase
            .from("connections")
            .insert({
              user_a: user.id,
              user_b: receiverId,
              status: "pending",
            });

          if (insertError) {
            console.error("CONNECT INSERT ERROR:", insertError);
            alert("Failed to send connection request.");
            return;
          }

          console.log("CONNECT REQUEST SENT:", {
            from: user.id,
            to: receiverId,
          });

          alert("Connection request sent.");
          break;
        }

        case "wave":
        case "like":
        case "support": {
          const receiverId = host?.user_id;

          console.log("ACTION RECEIVED:", {
            type,
            senderId: user?.id,
            receiverId,
            host,
          });

          if (!receiverId || !user?.id) {
            console.error("ACTION FAILED: missing user or receiver", {
              type,
              senderId: user?.id,
              receiverId,
              host,
            });
            return;
          }

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

          const { error: actionError } = await supabase
            .from("messages")
            .insert({
              sender_id: user.id,
              receiver_id: receiverId,
              text,
              event: type,
              created_at: new Date().toISOString(),
            });

          if (actionError) {
            console.error(
              `${type.toUpperCase()} SUPABASE ERROR:`,
              actionError
            );

            alert(
              `${type === "wave" ? "Wave" : "Like"} failed: ` +
              actionError.message
            );

            return;
          }

          console.log(
            `${type.toUpperCase()} SENT SUCCESSFULLY`,
            {
              senderId: user.id,
              receiverId,
            }
          );

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
  <div style={header(theme)}>

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
    <div
      style={{
        ...networkDropdownHeader,
        justifyContent: "space-between",
      }}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
        }}
      >
        <span style={networkDot}></span>
        <span>Cirql Network</span>
      </span>

      <span style={networkBetaBadge}>
        BETA
      </span>
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

    <div style={{ height: 10 }}></div>

    <button
      type="button"
      style={networkInfoRow}
      onClick={() => setNetworkView("founding")}
    >
      <span>
        <span style={{ display: "block", fontSize: 11, fontWeight: 650 }}>
          First 100 member benefits
        </span>

        <span
          style={{
            display: "block",
            marginTop: 2,
            fontSize: 9,
            opacity: 0.48,
          }}
        >
          Lifetime access · Founder recognition
        </span>
      </span>

      <span style={networkArrow}>&rarr;</span>
    </button>

    <button
      type="button"
      style={networkInfoRow}
      onClick={() =>
        window.open(
          "https://github.com/Statx09/opencirqlproxy",
          "_blank",
          "noopener,noreferrer"
        )
      }
    >
      <span>
        <span style={{ display: "block", fontSize: 11, fontWeight: 650 }}>
          GitHub
        </span>
      </span>

      <span style={networkArrow}>&rarr;</span>
    </button>

    <button
      type="button"
      style={networkInfoRow}
      onClick={() => setNetworkView("web3")}
    >
      <span>
        <span style={{ display: "block", fontSize: 11, fontWeight: 650 }}>
          Web3 enabled
        </span>

        <span
          style={{
            display: "block",
            marginTop: 2,
            fontSize: 9,
            opacity: 0.48,
          }}
        >
          Call rate · USDC escrow
        </span>
      </span>

      <span style={networkArrow}>&rarr;</span>
    </button>

    <div style={networkDivider}></div>

    <button
      type="button"
      style={networkTransparency}
      onClick={() => setNetworkView("transparency")}
    >
      <span>Network costs</span>
      <span>&rarr;</span>
    </button>

    <div style={networkDivider}></div>
  </>
) : networkView === "founding" ? (
  <>
    <button
      type="button"
      style={networkBack}
      onClick={() => setNetworkView("main")}
    >
      <span>&larr;</span>
      <span>Cirql Network</span>
    </button>

    <div style={networkTransparencyTitle}>
      First 100 member benefits
    </div>

    <div style={networkTransparencySubtitle}>
      Founding beta
    </div>

    <div style={networkCosts}>
      <div style={networkCostRow}>
        <span>Lifetime access</span>
        <strong>Free</strong>
      </div>

      <div style={networkCostRow}>
        <span>Founder recognition</span>
        <strong>Included</strong>
      </div>

      <div style={networkCostRow}>
        <span>Early access</span>
        <strong>Included</strong>
      </div>

      <div style={networkCostRow}>
        <span>Founding network</span>
        <strong>100</strong>
      </div>
    </div>

    <div style={networkDivider}></div>
  </>
) : networkView === "web3" ? (
  <>
    <button
      type="button"
      style={networkBack}
      onClick={() => setNetworkView("main")}
    >
      <span>&larr;</span>
      <span>Cirql Network</span>
    </button>

    <div
      style={{
        padding: "10px 2px 8px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "-0.01em",
        }}
      >
        Web3 calls
      </div>

      <div
        style={{
          marginTop: 3,
          fontSize: 9,
          opacity: 0.42,
        }}
      >
        Solana · USDC
      </div>
    </div>

    <div
      style={{
        marginTop: 8,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div
        style={{
          padding: "10px 11px",
          borderRadius: 9,
          background: "rgba(255,255,255,.035)",
          border: "1px solid rgba(255,255,255,.06)",
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
          }}
        >
          Set your rate
        </div>

        <div
          style={{
            marginTop: 3,
            fontSize: 9,
            lineHeight: 1.45,
            opacity: 0.48,
          }}
        >
          Host chooses the price per minute.
        </div>
      </div>

      <div
        style={{
          padding: "10px 11px",
          borderRadius: 9,
          background: "rgba(255,255,255,.035)",
          border: "1px solid rgba(255,255,255,.06)",
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
          }}
        >
          Connect & call
        </div>

        <div
          style={{
            marginTop: 3,
            fontSize: 9,
            lineHeight: 1.45,
            opacity: 0.48,
          }}
        >
          Both wallets connect. Call time is tracked.
        </div>
      </div>

      <div
        style={{
          padding: "10px 11px",
          borderRadius: 9,
          background: "rgba(255,255,255,.035)",
          border: "1px solid rgba(255,255,255,.06)",
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
          }}
        >
          Automatic settlement
        </div>

        <div
          style={{
            marginTop: 3,
            fontSize: 9,
            lineHeight: 1.45,
            opacity: 0.48,
          }}
        >
          When the call ends, payment is calculated from call time and settled automatically.
        </div>
      </div>
    </div>

    <div
      style={{
        marginTop: 12,
        textAlign: "center",
        fontSize: 8,
        letterSpacing: "0.08em",
        opacity: 0.28,
        textTransform: "uppercase",
      }}
    >
      Wallet · Call · Settlement
    </div>

    <div style={networkDivider}></div>
  </>
) : (
  <>
    <button
      type="button"
      style={networkBack}
      onClick={() => setNetworkView("main")}
    >
      <span>&larr;</span>
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

    <div style={headerActions}>
  <div style={settingsWrap}>
    <button
      type="button"
      style={settingsButton(theme)}
      onClick={() => setShowSettings((v) => !v)}
      aria-label="Settings"
    >
      <Settings size={17} strokeWidth={2} />
    </button>

    {showSettings && (
      <div style={settingsDropdown(theme)}>

        <div style={settingsSection}>
          <div style={settingsLabel}>Appearance</div>

          <button
            type="button"
            style={settingsRow(theme)}
            onClick={toggleTheme}
          >
            <span style={settingsRowLeft}>
              {theme.mode === "dark" ? (
                <Moon size={15} strokeWidth={2} />
              ) : (
                <Sun size={15} strokeWidth={2} />
              )}
              <span>Dark mode</span>
            </span>

            <span style={settingsValue}>
              {theme.mode === "dark" ? "Dark" : "Light"}
            </span>
          </button>
        </div>

        <div style={settingsDivider}></div>

        <div style={settingsSection}>
          <div style={settingsLabel}>Notifications</div>

          <button
            type="button"
            style={settingsRow(theme)}
            onClick={() =>
              setNotificationsEnabled((v) => !v)
            }
          >
            <span style={settingsRowLeft}>
              <span style={settingsBell}></span>
              <span>Notifications</span>
            </span>

            <span
              style={{
                ...settingsSwitch,
                background: notificationsEnabled
                  ? "#22c55e"
                  : "rgba(148,163,184,.22)",
              }}
            >
              <span
                style={{
                  ...settingsSwitchKnob,
                  transform: notificationsEnabled
                    ? "translateX(14px)"
                    : "translateX(2px)",
                }}
              />
            </span>
          </button>

          {notificationsEnabled && (
            <div style={{ paddingLeft: 22 }}>
              {[
                ["messages", "Messages"],
                ["voiceCalls", "Voice calls"],
                ["videoCalls", "Video calls"],
                ["connections", "Connections"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  style={settingsRow(theme)}
                  onClick={() =>
                    setNotificationSettings((prev) => ({
                      ...prev,
                      [key]: !prev[key],
                    }))
                  }
                >
                  <span style={settingsRowLeft}>
                    <span>{label}</span>
                  </span>

                  <span
                    style={{
                      ...settingsSwitch,
                      background: notificationSettings[key]
                        ? "#22c55e"
                        : "rgba(148,163,184,.22)",
                    }}
                  >
                    <span
                      style={{
                        ...settingsSwitchKnob,
                        transform: notificationSettings[key]
                          ? "translateX(14px)"
                          : "translateX(2px)",
                      }}
                    />
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={settingsDivider}></div>

        <div style={settingsSection}>
          <div style={settingsLabel}>Web3</div>

          <button
            type="button"
            style={settingsRow(theme)}
            onClick={() => {
              setShowSettings(false);
              setNetworkView("web3");
              setShowNetwork(true);
            }}
          >
            <span style={settingsRowLeft}>
              <span style={settingsBell}></span>
              <span>Connect Wallet</span>
            </span>

            <span style={settingsValue}>&rarr;</span>
          </button>
        </div>

        <div style={settingsDivider}></div>

        {authUser ? (
          <button
            type="button"
            style={settingsLogout}
            onClick={async () => {
              setShowSettings(false);
              await logout();
            }}
          >
            Log out
          </button>
        ) : (
          <button
            type="button"
            style={{
              ...settingsLogout,
              color: "#22c55e",
              borderColor: "rgba(34,197,94,.28)",
              background: "rgba(34,197,94,.08)",
            }}
            onClick={async () => {
              setShowSettings(false);
              await login();
            }}
          >
            Log in
          </button>
        )}

      </div>
    )}
  </div>

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
      <Grid3X3 size={19} strokeWidth={1.8} />
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
  unreadConnectionRequestCount={unreadConnectionRequestCount}
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
{/* OUTGOING CALL */}
      {outgoingCall && (
        <div
          style={{
            position: "fixed",
            left: "50%",
            bottom: "28px",
            transform: "translateX(-50%)",
            zIndex: 100009,
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "10px 14px 10px 10px",
            borderRadius: "999px",
            background: "rgba(15,23,42,.94)",
            border: "1px solid rgba(34,197,94,.35)",
            boxShadow: "0 12px 40px rgba(0,0,0,.35)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            color: "#fff",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              overflow: "hidden",
              background: "rgba(255,255,255,.08)",
              border: "2px solid #22c55e",
              boxShadow: "0 0 0 4px rgba(34,197,94,.12)",
              flexShrink: 0,
            }}
          >
            {outgoingCall.avatar_url || outgoingCall.avatar ? (
              <img
                src={outgoingCall.avatar_url || outgoingCall.avatar}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                }}
              >
                📹
              </div>
            )}
          </div>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 700,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "180px",
              }}
            >
              Calling {outgoingCall.name || "Host"}
            </div>

            <div
              style={{
                fontSize: "11px",
                color: "#22c55e",
                marginTop: "2px",
              }}
            >
              Waiting for answer...
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              console.log("OUTGOING CALL CANCELLED");
              setOutgoingCall(null);
              setSelectedHost(null);
            }}
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,.12)",
              background: "rgba(255,255,255,.07)",
              color: "#fff",
              cursor: "pointer",
              fontSize: "15px",
            }}
            aria-label="Cancel call"
            title="Cancel call"
          >
            ×
          </button>
        </div>
      )}

      {incomingCall && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100010,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            background: "rgba(0,0,0,.55)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "340px",
              padding: "24px",
              borderRadius: "22px",
              background: "rgba(15,23,42,.97)",
              border: "1px solid rgba(255,255,255,.12)",
              boxShadow: "0 24px 70px rgba(0,0,0,.5)",
              color: "#fff",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                color: "#22c55e",
                marginBottom: "16px",
              }}
            >
              Incoming call
            </div>

            <div
              style={{
                width: "76px",
                height: "76px",
                margin: "0 auto 14px",
                borderRadius: "50%",
                overflow: "hidden",
                background: "rgba(255,255,255,.08)",
                border: "2px solid #22c55e",
                boxShadow: "0 0 0 5px rgba(34,197,94,.12)",
              }}
            >
              {incomingCall.callerProfile?.avatar_url ||
              incomingCall.callerProfile?.avatar ? (
                <img
                  src={
                    incomingCall.callerProfile.avatar_url ||
                    incomingCall.callerProfile.avatar
                  }
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "28px",
                  }}
                >
                  📹
                </div>
              )}
            </div>

            <div
              style={{
                fontSize: "20px",
                fontWeight: 800,
                letterSpacing: "-.3px",
              }}
            >
              {incomingCall.callerProfile?.name || "Someone"}
            </div>

            <div
              style={{
                marginTop: "5px",
                fontSize: "12px",
                opacity: 0.5,
              }}
            >
              {incomingCall.payload?.call_type === "audio"
                ? "Voice call"
                : "Video call"}
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "26px",
              }}
            >
              <button
                type="button"
                onClick={async () => {
                  console.log(
                    "INCOMING CALL DECLINED:",
                    incomingCall
                  );

                  setIncomingCall(null);
                }}
                style={{
                  flex: 1,
                  height: "46px",
                  borderRadius: "999px",
                  border: "1px solid rgba(239,68,68,.35)",
                  background: "rgba(239,68,68,.12)",
                  color: "#f87171",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Decline
              </button>

              <button
                type="button"
                onClick={async () => {
                  console.log(
                    "INCOMING CALL ACCEPTED:",
                    incomingCall
                  );

                  const { error } = await supabase
                    .from("messages")
                    .insert({
                      sender_id: user.id,
                      receiver_id: incomingCall.sender_id,
                      text: `${user?.name || "User"} accepted your call`,
                      private: true,
                      event: "call_accepted",
                      payload: {
                        call_type:
                          incomingCall.payload?.call_type || "video",
                      },
                      created_at: new Date().toISOString(),
                    });

                  if (error) {
                    console.error(
                      "CALL ACCEPT ERROR:",
                      error
                    );
                    return;
                  }

                  setSelectedHost(
                    incomingCall.callerProfile || null
                  );
                  setIncomingCall(null);
                  setActiveModal("callsStudio");
                }}
                style={{
                  flex: 1,
                  height: "46px",
                  borderRadius: "999px",
                  border: "1px solid rgba(34,197,94,.4)",
                  background: "#22c55e",
                  color: "#052e16",
                  fontSize: "13px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Accept
              </button>
            </div>
          </div>
        </div>
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
        onAction={handleAction}
      />
    </div>
  </>
)}

      {activeModal === "userProfile" && (
        <ModalShell title="Identity Studio" onClose={closeModal}>
          <ProfileTab
  user={user}
  onViewCard={() => handleOpenProfile(user?.id)}
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
  <ConnectionsContent
    user={user}
    onClose={closeModal}
    onOpenProfile={handleOpenProfile}
    onAction={handleAction}
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

  background: "rgba(20,20,25,.72)",

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
  top: 80,
  left: 16,

  width: 44,
  height: 44,
  padding: 0,

  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  borderRadius: "50%",

  background: "rgba(20,20,25,.72)",

  border: "1px solid rgba(255,255,255,0.12)",

  color: "#fff",

  cursor: "pointer",

  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",

  boxShadow:
    "0 8px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",

  boxSizing: "border-box",

  zIndex: 9500,
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




















































































































const networkBetaBadge = {
  padding: "3px 6px",
  borderRadius: 5,
  background: "rgba(34,197,94,.12)",
  border: "1px solid rgba(34,197,94,.22)",
  color: "#22c55e",
  fontSize: 8,
  fontWeight: 800,
  letterSpacing: "0.5px",
};

const networkFounding = {
  marginTop: 16,
  padding: "11px 12px",
  borderRadius: 10,
  background: "rgba(34,197,94,.055)",
  border: "1px solid rgba(34,197,94,.12)",
};

const networkFoundingLabel = {
  fontSize: 8,
  fontWeight: 800,
  letterSpacing: "0.7px",
  color: "#22c55e",
};

const networkFoundingTitle = {
  marginTop: 4,
  fontSize: 13,
  fontWeight: 750,
};

const networkFoundingSubtitle = {
  marginTop: 3,
  fontSize: 9,
  lineHeight: 1.4,
  opacity: 0.52,
};

const networkInfoRow = {
  width: "100%",
  padding: "9px 2px",
  border: "none",
  background: "transparent",
  color: "inherit",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  textAlign: "left",
  cursor: "pointer",
};

const networkArrow = {
  fontSize: 14,
  opacity: 0.45,
  marginLeft: 8,
};

const networkWeb3Card = {
  marginTop: 18,
  padding: 12,
  borderRadius: 10,
  background: "rgba(148,163,184,.055)",
  border: "1px solid rgba(148,163,184,.12)",
};

const networkWeb3Status = {
  display: "flex",
  alignItems: "center",
  gap: 7,
  fontSize: 10,
  fontWeight: 700,
};

const networkWeb3Text = {
  marginTop: 9,
  fontSize: 11,
  lineHeight: 1.5,
  opacity: 0.62,
};


































