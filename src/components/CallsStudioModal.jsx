import React, { useEffect, useState } from "react";
import DailyRoom from "./daily/DailyRoom";
import ConnectionRequests from "./ConnectionRequests";
import SayThanksModal from "./SayThanksModal";
import { getConnectionStatus } from "../api/getConnectionStatus";
import { supabase } from "../lib/supabaseClient";
import {
  Users,
  DollarSign,
  X,
} from "lucide-react";

export default function CallsStudioModal({
  user,
  host,
  callId,
  onClose,
}) {
  const [activePanel, setActivePanel] = useState(null);
  const [showThanks, setShowThanks] = useState(false);
  const [connection, setConnection] = useState(null);
  const [checkingConnection, setCheckingConnection] = useState(false);
  const [billingState, setBillingState] = useState(null);

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

  useEffect(() => {
    if (!callId || !user?.id) return;

    let cancelled = false;

    const billCall = async () => {
      const { data, error } = await supabase.rpc(
        "bill_call_interval",
        { p_call_id: callId }
      );

      if (cancelled) return;

      if (error) {
        console.error("CALL BILLING ERROR:", error);

        if (error.message?.includes("INSUFFICIENT_BALANCE")) {
          console.warn("CALL BILLING STOPPED: insufficient balance.");
          onClose();
        }

        return;
      }

      setBillingState(data);
      console.log("CALL BILLING:", JSON.stringify(data, null, 2));
    };

    billCall();

    const interval = setInterval(billCall, 10000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [callId, user?.id, onClose]);

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
  onLeave={onClose}
/> 
      </div>

      {/* FINANCIAL HUD */}
      {billingState && (
        <div
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            zIndex: 20,
            padding: "8px 12px",
            borderRadius: 10,
            background: "rgba(0,0,0,0.65)",
            color: "#fff",
            fontSize: 13,
            lineHeight: 1.4,
            pointerEvents: "none",
          }}
        >
          {host?.user_id === user?.id ? (
            <div>
              Earned ${Number(
                billingState.earned ??
                billingState.host_earned ??
                billingState.amount_earned ??
                0
              ).toFixed(2)}
            </div>
          ) : (
            <>
              <div>
                Spent ${Number(
                  billingState.spent ??
                  billingState.charged ??
                  billingState.amount_charged ??
                  0
                ).toFixed(2)}
              </div>
              <div>
                Balance ${Number(
                  billingState.balance ??
                  billingState.remaining_balance ??
                  billingState.new_balance ??
                  0
                ).toFixed(2)}
              </div>
            </>
          )}
        </div>
      )}

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
  right: 16,
  top: "calc(50% + 68px)",

  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,

  padding: "9px 13px",

  borderRadius: 999,

  border: "1px solid rgba(255,255,255,.14)",

  background: "rgba(20,20,25,.60)",

  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",

  color: "#fff",

  fontSize: 12,
  fontWeight: 600,

  cursor: "pointer",

  boxShadow:
    "0 4px 18px rgba(0,0,0,.28), inset 0 1px rgba(255,255,255,.05)",

  transition: "all .2s ease",

  zIndex: 35,
};

const randomCallIcon = {
  width: 24,
  height: 24,

  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  borderRadius: "50%",

  background: "rgba(255,255,255,.08)",

  color: "#fff",

  fontSize: 17,
  lineHeight: 1,

  flexShrink: 0,
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




