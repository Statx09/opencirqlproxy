import React, { useEffect, useState } from "react";
import DailyRoom from "./daily/DailyRoom";
import ConnectionRequests from "./ConnectionRequests";
import SayThanksModal from "./SayThanksModal";
import { getConnectionStatus } from "../api/getConnectionStatus";
import {
  Users,
  DollarSign,
  X,
} from "lucide-react";

export default function CallsStudioModal({
  user,
  host,
  onClose,
}) {
  const [activePanel, setActivePanel] = useState(null);
  const [showThanks, setShowThanks] = useState(false);
  const [connection, setConnection] = useState(null);
  const [checkingConnection, setCheckingConnection] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkConnection() {
      if (!user?.id || !host?.user_id) {
        setConnection(null);
        setCheckingConnection(false);
        return;
      }

      setCheckingConnection(true);

      try {
        const result = await getConnectionStatus(
          user.id,
          host.user_id
        );

        if (!cancelled) {
          setConnection(result);
        }
      } catch (error) {
        console.error(
          "Connection check failed:",
          error
        );

        if (!cancelled) {
          setConnection(null);
        }
      } finally {
        if (!cancelled) {
          setCheckingConnection(false);
        }
      }
    }

    checkConnection();

    return () => {
      cancelled = true;
    };
  }, [user?.id, host?.user_id]);

  if (!user?.id) return null;

  const togglePanel = (panelName) => {
    setActivePanel((current) =>
      current === panelName ? null : panelName
    );
  };

  const isConnected =
    connection?.status === "accepted";

  return (
    <div style={overlay}>

      {/* VIDEO */}
      <div style={videoArea}>
        <DailyRoom
          roomUrl="https://cirqll.daily.co/cirqll"
          displayName={user.email || "Guest"}
        />
      </div>

      {/* TOP BAR */}
      <div style={topBar}>
        <div style={title}>
          OpenCall Studio
        </div>

        <button
          type="button"
          onClick={onClose}
          style={closeBtn}
          aria-label="Close Call Studio"
          title="Close"
        >
          <X size={20} strokeWidth={2.2} />
        </button>
      </div>

      {/* HOST STATUS */}
      {host && (
        <div style={hostStatus}>
          <div style={hostName}>
            Calling {host.name || "Host"}
          </div>

          {checkingConnection ? (
            <div style={connectionStatus}>
              Checking connection...
            </div>
          ) : isConnected ? (
            <div
              style={{
                ...connectionStatus,
                color: "#22c55e",
              }}
            >
              ✓ Connected
            </div>
          ) : (
            <div
              style={{
                ...connectionStatus,
                color: "#f59e0b",
              }}
            >
              Connection required
            </div>
          )}
        </div>
      )}

      {/* RIGHT ACTION RAIL */}
      <div style={actionRail}>

        {/* CONNECTIONS */}
        <button
          type="button"
          style={{
            ...actionButton,
            ...(activePanel === "connections"
              ? activeButton
              : {}),
          }}
          onClick={() =>
            togglePanel("connections")
          }
          aria-label="Connections"
          title="Connections"
        >
          <Users
            size={20}
            strokeWidth={2.1}
          />
        </button>

        {/* TIP HOST */}
        <button
          type="button"
          style={actionButton}
          onClick={() =>
            setShowThanks(true)
          }
          aria-label="Tip Host"
          title="Tip Host"
        >
          <DollarSign
            size={20}
            strokeWidth={2.1}
          />
        </button>

      </div>

      {/* RANDOM CALL */}
      <button
        type="button"
        style={randomCallButton}
        onClick={() => {
          console.log(
            "RANDOM CALL — MATCHING SYSTEM COMING SOON"
          );
        }}
        aria-label="Random Call"
        title="Random Call"
      >
        <span style={randomCallIcon}>
          ⤨
        </span>

        <span>
          Random Call
        </span>
      </button>

      {/* CONNECTIONS PANEL */}
      {activePanel === "connections" && (
        <div style={panel}>

          <div style={panelHeader}>
            <span>
              Connections
            </span>

            <button
              type="button"
              onClick={() =>
                setActivePanel(null)
              }
              style={panelClose}
              aria-label="Close Connections"
            >
              <X size={17} />
            </button>
          </div>

          <div style={panelBody}>
            <ConnectionRequests
              user={user}
            />
          </div>

        </div>
      )}

      {/* TIP */}
      {showThanks && (
        <SayThanksModal
          host={host || null}
          user={user}
          onClose={() =>
            setShowThanks(false)
          }
        />
      )}

    </div>
  );
}

/* =========================================================
   STYLES
========================================================= */

const overlay = {
  position: "fixed",
  inset: 0,
  width: "100vw",
  height: "100vh",
  background: "#000",
  zIndex: 99999,
  overflow: "hidden",
};

const videoArea = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  background: "#000",
};

const topBar = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: 64,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 18px",
  background:
    "linear-gradient(to bottom, rgba(0,0,0,.75), rgba(0,0,0,0))",
  zIndex: 20,
  pointerEvents: "none",
};

const title = {
  color: "#fff",
  fontSize: 18,
  fontWeight: 700,
  textShadow:
    "0 2px 8px rgba(0,0,0,.5)",
};

const closeBtn = {
  width: 42,
  height: 42,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  border:
    "1px solid rgba(255,255,255,.15)",
  background:
    "rgba(20,20,25,.55)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter:
    "blur(18px)",
  color: "#fff",
  cursor: "pointer",
  pointerEvents: "auto",
  boxShadow:
    "0 4px 18px rgba(0,0,0,.28), inset 0 1px rgba(255,255,255,.05)",
};

const hostStatus = {
  position: "absolute",
  top: 72,
  left: 18,
  padding:
    "10px 14px",
  borderRadius: 14,
  background:
    "rgba(15,23,42,.72)",
  backdropFilter:
    "blur(18px)",
  WebkitBackdropFilter:
    "blur(18px)",
  border:
    "1px solid rgba(255,255,255,.12)",
  zIndex: 30,
};

const hostName = {
  color: "#fff",
  fontSize: 14,
  fontWeight: 700,
};

const connectionStatus = {
  marginTop: 3,
  color: "#94a3b8",
  fontSize: 12,
};

const actionRail = {
  position: "absolute",
  right: 16,
  top: "50%",
  transform:
    "translateY(-50%)",
  display: "flex",
  flexDirection: "column",
  gap: 12,
  zIndex: 35,
};

const actionButton = {
  width: 48,
  height: 48,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  border:
    "1px solid rgba(255,255,255,.15)",
  background:
    "rgba(20,20,25,.55)",
  backdropFilter:
    "blur(18px)",
  WebkitBackdropFilter:
    "blur(18px)",
  color: "#fff",
  cursor: "pointer",
  boxShadow:
    "0 4px 18px rgba(0,0,0,.30), inset 0 1px rgba(255,255,255,.05)",
  transition:
    "all .2s ease",
};

const activeButton = {
  background:
    "rgba(124,58,237,.65)",
  border:
    "1px solid rgba(167,139,250,.55)",
  boxShadow:
    "0 4px 20px rgba(124,58,237,.30)",
};

const randomCallButton = {
  position: "absolute",
  right: 90,
  bottom: 105,

  display: "flex",
  alignItems: "center",
  gap: 8,

  padding: "12px 20px",

  borderRadius: 999,

  border:
    "1px solid rgba(139,92,246,.55)",

  background:
    "rgba(88,28,135,.72)",

  backdropFilter: "blur(18px)",
  WebkitBackdropFilter:
    "blur(18px)",

  color: "#fff",

  fontSize: 14,
  fontWeight: 700,

  cursor: "pointer",

  boxShadow:
    "0 8px 30px rgba(88,28,135,.35)",

  zIndex: 35,
};

const randomCallIcon = {
  fontSize: 20,
  lineHeight: 1,
};

const panel = {
  position: "absolute",
  left: 16,
  right: 80,
  bottom: 100,
  maxHeight: "65vh",
  background:
    "rgba(15,23,42,.92)",
  backdropFilter:
    "blur(24px)",
  WebkitBackdropFilter:
    "blur(24px)",
  border:
    "1px solid rgba(255,255,255,.12)",
  borderRadius: 20,
  overflow: "auto",
  zIndex: 40,
  boxShadow:
    "0 20px 60px rgba(0,0,0,.5)",
};

const panelHeader = {
  height: 56,
  display: "flex",
  alignItems: "center",
  justifyContent:
    "space-between",
  padding: "0 16px",
  color: "#fff",
  fontWeight: 700,
  borderBottom:
    "1px solid rgba(255,255,255,.08)",
};

const panelClose = {
  width: 34,
  height: 34,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  border: "none",
  background:
    "rgba(255,255,255,.08)",
  color: "#fff",
  cursor: "pointer",
};

const panelBody = {
  padding: 12,
};
