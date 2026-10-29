import React, { useCallback, useEffect, useRef, useState } from "react";
import DailyRoom from "./daily/DailyRoom";
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
  onAction,
}) {
  const [activePanel, setActivePanel] = useState(null);
  const [showThanks, setShowThanks] = useState(false);
  const [connection, setConnection] = useState(null);
  const [checkingConnection, setCheckingConnection] = useState(false);
  const [billingState, setBillingState] = useState(null);
  const [isCallHost, setIsCallHost] = useState(null);
  const [liveBilling, setLiveBilling] = useState({ host_credit: 0, caller_spent: 0, caller_balance: 0 });
  const [tipEarned, setTipEarned] = useState(0);
  const [billingPulse, setBillingPulse] = useState(false);
  const previousHudValuesRef = useRef(null);
  const [callEnded, setCallEnded] = useState(false);
  const [dailyConnected, setDailyConnected] = useState(false);
  const [billingStarted, setBillingStarted] = useState(false);
  useEffect(() => {
    const values = [
      Number(liveBilling?.host_credit ?? 0),
      Number(liveBilling?.caller_spent ?? 0),
      Number(liveBilling?.caller_balance ?? 0),
      Number(tipEarned ?? 0),
    ];
    const previous = previousHudValuesRef.current;
    previousHudValuesRef.current = values;

    if (
      !billingStarted ||
      !previous ||
      values.every((value, index) => value === previous[index])
    ) return;

    setBillingPulse(true);
    const timer = setTimeout(() => setBillingPulse(false), 850);
    return () => clearTimeout(timer);
  }, [
    liveBilling?.host_credit,
    liveBilling?.caller_spent,
    liveBilling?.caller_balance,
    tipEarned,
    billingStarted,
  ]);

  const callerRateRef = useRef(0);
  const hostRateRef = useRef(0);
  const callerStartingBalanceRef = useRef(null);
  const previousBillingRef = useRef(null);
  const billingStartedRef = useRef(false);
  const insufficientBalanceHandlingRef = useRef(false);

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

  const handleDailyJoined = async () => {
    setDailyConnected(true);
    if (!callId || !user?.id) return;
    if (billingStartedRef.current) return;

    const { data, error } = await supabase
      .from("calls")
      .select("caller_id")
      .eq("id", callId)
      .single();

    if (error) {
      console.error("CALL BILLING START ROLE ERROR:", error);
      return;
    }

    if (data?.caller_id !== user.id) return;

    const { error: updateError } = await supabase
      .from("calls")
      .update({
        start_time: new Date().toISOString(),
        status: "active",
      })
      .eq("id", callId)
      .eq("caller_id", user.id);

    if (updateError) {
      console.error("CALL BILLING START ERROR:", updateError);
      return;
    }

    billingStartedRef.current = true;
    setBillingStarted(true);

    console.log("CALL BILLING STARTED:", callId);
  };

  useEffect(() => { if (!callId || !user?.id || !dailyConnected || billingStarted) return; let cancelled = false; const syncBillingStarted = async () => { const { data, error } = await supabase.from("calls").select("status, start_time").eq("id", callId).maybeSingle(); if (cancelled || error || data?.status !== "active" || !data?.start_time) return; billingStartedRef.current = true; setBillingStarted(true); }; syncBillingStarted(); const interval = setInterval(syncBillingStarted, 1000); return () => { cancelled = true; clearInterval(interval); }; }, [callId, user?.id, dailyConnected, billingStarted]);
  const handleDailyLeave = useCallback(async () => {
    setCallEnded(true);

    if (callId) {
      const { error } = await supabase.rpc("settle_call", {
        p_call_id: callId,
      });

      if (error) {
        console.error("CALL SETTLE FAILED:", error);
      } else {
        console.log("CALL SETTLED:", callId);
      }
    }

    onClose?.();
  }, [callId, onClose]);

  useEffect(() => {
    if (!callId) return;

    let cancelled = false;

    const checkCallStatus = async () => {
      const { data, error } = await supabase
        .from("calls")
        .select("status")
        .eq("id", callId)
        .single();

      if (error) {
        console.error("CALL STATUS CHECK FAILED:", error);
        return;
      }

      if (cancelled) return;

      console.log(
        "CALL STATUS POLL:",
        callId,
        data?.status
      );

      if (data?.status === "completed") {
        setCallEnded(true);

        console.log(
          "CALL ENDED BY OTHER PARTICIPANT:",
          callId
        );

        console.log(
          "CALL POLL CLOSING MODAL:",
          callId,
          "onClose exists:",
          typeof onClose
        );

        onClose?.();
      }
    };

    checkCallStatus();

    const interval = setInterval(checkCallStatus, 2000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [callId, onClose]);

  useEffect(() => {
    if (!callId) return;

    const channel = supabase
      .channel(`call-status-${callId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "calls",
          filter: `id=eq.${callId}`,
        },
        (payload) => {
          const newStatus = payload.new?.status;

          console.log(
            "CALL STATUS UPDATE:",
            callId,
            newStatus
          );

          if (newStatus === "completed") {
             setCallEnded(true);
            console.log(
              "CALL ENDED REMOTELY:",
              callId
            );

            onClose?.();
          }
        }
      )
      .subscribe((status) => {
        console.log("CALL REALTIME STATUS:", callId, status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [callId, onClose]);

  useEffect(() => {
    if (!callId || !user?.id || !isCallHost) return;

    const channel = supabase
      .channel(`call-tip-${callId}-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "wallet_transactions",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const transaction = payload.new;

          if (
            transaction?.type !== "tip_received" ||
            transaction?.status !== "completed"
          ) {
            return;
          }

          const amount = Number(transaction.amount || 0);

          if (amount <= 0) return;

          setTipEarned((current) => Number(current || 0) + amount);

          console.log("CALL TIP REALTIME:", transaction);
        }
      )
      .subscribe((status) => {
        console.log("CALL TIP REALTIME STATUS:", callId, status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [callId, user?.id, isCallHost]);
  useEffect(() => {
    if (!callId || !user?.id) return;

    let cancelled = false;

    const loadCallRole = async () => {
      const { data, error } = await supabase
        .from("calls")
        .select("host_id, rate")
        .eq("id", callId)
        .single();

      if (cancelled) return;

      if (error) {
        console.error("CALL ROLE ERROR:", error);
        return;
      }

      setIsCallHost(data?.host_id === user.id);

      if (data?.rate != null) {
        callerRateRef.current = Number(data.rate) / 60;
        hostRateRef.current = Math.max(0, Number(data.rate) - 0.10) / 60;
      }
    };

    const billCall = async () => {
      if (!dailyConnected || !billingStartedRef.current) return;
      if (isCallHost === null) return;
      if (isCallHost === false && !billingStartedRef.current) return;

      if (isCallHost === true) {
        const { data, error } = await supabase
          .from("call_earnings")
          .select("duration_seconds, host_amount, status")
          .eq("call_id", callId)
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          console.error("HOST EARNINGS ERROR:", error);
          return;
        }

        if (!data) return;

        const currentHostAmount = Number(
          data.host_amount ?? 0
        );

        const hostDuration = Number(
          data.duration_seconds ?? 0
        );

        if (hostDuration > 0) {
          hostRateRef.current =
            currentHostAmount / hostDuration;
        }

        setBillingState(data);

        setLiveBilling((current) => ({
          ...(current || {}),
          host_credit: currentHostAmount,
          caller_spent: Number(
            current?.caller_spent ?? 0
          ),
          caller_balance: Number(
            current?.caller_balance ?? 0
          ),
        }));

        console.log(
          "HOST EARNINGS:",
          JSON.stringify(data, null, 2)
        );

        return;
      }

      const { data, error } = await supabase.rpc(
        "bill_call_interval",
        { p_call_id: callId }
      );

      if (cancelled) return;

      if (error) {
        console.error("CALL BILLING ERROR:", error);

        if (error.message?.includes("INSUFFICIENT_BALANCE")) {
          if (insufficientBalanceHandlingRef.current) return;
          insufficientBalanceHandlingRef.current = true;

          console.warn("CALL BILLING STOPPED: insufficient balance.");

          const { data: finalizeData, error: finalizeError } =
            await supabase.rpc("end_call_after_insufficient_balance", {
              p_call_id: callId,
            });

          if (finalizeError) {
            console.error(
              "CALL FINALIZATION AFTER INSUFFICIENT BALANCE FAILED:",
              finalizeError
            );
            insufficientBalanceHandlingRef.current = false;
          } else {
            console.log(
              "CALL FINALIZED AT LAST BILLED CUTOFF:",
              finalizeData
            );
            setCallEnded(true);
            onClose?.();
          }
        }

        return;
      }

      const currentDuration = Number(data?.duration_seconds ?? 0);
      const currentHostCredit = Number(data?.host_credit ?? 0);
      const callerBalance = Number(data?.caller_balance ?? 0);
      const callerCharge = Number(data?.caller_charge ?? 0);

      if (callerStartingBalanceRef.current === null) {
        callerStartingBalanceRef.current =
          callerBalance + callerCharge;
      }

      const callerSpent = Math.max(
        0,
        callerStartingBalanceRef.current - callerBalance
      );

      const previous = previousBillingRef.current;

      if (previous && currentDuration > previous.duration) {
        const durationDelta =
          currentDuration - previous.duration;

        const hostDelta =
          currentHostCredit - previous.host_credit;

        if (hostDelta >= 0 && durationDelta > 0) {
          hostRateRef.current =
            hostDelta / durationDelta;
        }
      }

      previousBillingRef.current = {
        duration: currentDuration,
        host_credit: currentHostCredit,
      };

      setBillingState(data);

      setLiveBilling({
        host_credit: currentHostCredit,
        caller_spent: callerSpent,
        caller_balance: callerBalance,
      });

      console.log(
        "CALL BILLING:",
        JSON.stringify(data, null, 2)
      );
    };

    loadCallRole();
    billCall();

    const interval = setInterval(billCall, 10000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [callId, user?.id, onClose, isCallHost, dailyConnected, billingStarted]);



  useEffect(() => {
    if (callEnded || !dailyConnected || !billingStarted || isCallHost === null) return;

    const ticker = setInterval(() => {
      setLiveBilling((current) => {
        if (!current) return current;

        if (isCallHost) {
          const rate = hostRateRef.current;
          if (!rate) return current;

          return {
            ...current,
            host_credit: Number(current.host_credit ?? 0) + rate,
          };
        }

        const rate = callerRateRef.current;
        if (!rate) return current;

        return {
          ...current,
          caller_spent: Number(current.caller_spent ?? 0) + rate,
          caller_balance: Math.max(
            0,
            Number(current.caller_balance ?? 0) - rate
          ),
        };
      });
    }, 1000);

    return () => clearInterval(ticker);
  }, [callEnded, dailyConnected, billingStarted, isCallHost]);
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
      <style>{`
        @keyframes upcallBillingPulse {
          0% { box-shadow: 0 8px 24px rgba(0,0,0,.18); }
          40% { box-shadow: 0 0 22px rgba(74,222,128,.28), 0 8px 24px rgba(0,0,0,.2); }
          100% { box-shadow: 0 8px 24px rgba(0,0,0,.18); }
        }
        .upcall-billing-hud {
          position: absolute;
          top: 128px;
          left: 18px;
          right: auto;
          z-index: 20;
          max-width: 220px;
          padding: 10px 14px;
          border: 1px solid rgba(255,255,255,.14);
          border-radius: 14px;
          background: rgba(15,23,42,.78);
          color: #fff;
          font-size: 13px;
          line-height: 1.65;
          font-variant-numeric: tabular-nums;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 8px 24px rgba(0,0,0,.18);
          pointer-events: none;
        }
        .upcall-billing-hud.is-pulsing {
          animation: upcallBillingPulse 850ms ease-out;
        }
        @media (max-width: 600px) {
          .upcall-billing-hud {
            top: 108px;
            left: 12px;
            right: auto;
            max-width: min(190px, calc(100vw - 24px));
            padding: 8px 11px;
            border-radius: 12px;
            font-size: 12px;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .upcall-billing-hud.is-pulsing { animation: none; }
        }
      `}</style>

      {/* FINANCIAL HUD */}
      {isCallHost !== null && liveBilling && (
        <div
          className={`upcall-billing-hud${billingPulse ? " is-pulsing" : ""}`}
        >
          {isCallHost ? (
            <>
              <div>
                Earned ${Number(
                  Number(liveBilling.host_credit ?? 0) + Number(tipEarned || 0)
                ).toFixed(2)}
              </div>
              {tipEarned > 0 && (
                <div style={{ color: "#22c55e", fontWeight: 700 }}>
                  +${Number(tipEarned).toFixed(2)} tip ðŸŽ‰
                </div>
              )}
            </>
          ) : (
            <>
              <div>
                Spent ${Number(
                  liveBilling.caller_spent ?? 0
                ).toFixed(2)}
              </div>
              <div>
                Balance ${Number(
                  liveBilling.caller_balance ?? 0
                ).toFixed(2)}
              </div>
            </>
          )}
        </div>
      )}

      {/* VIDEO */}
      <div style={videoArea}>
       {!callEnded && (
         <DailyRoom
           roomUrl="https://cirqll.daily.co/cirqll"
           displayName={user.email || "Guest"}
           onLeave={handleDailyLeave}
           onJoined={handleDailyJoined}
         />
       )}
      </div>

      {/* HOST STATUS */}
      {host && (
        <div style={hostStatus}>
          <div style={hostName}>
            Calling
          </div>

          {checkingConnection ? (
            <div style={connectionStatus}>
              Checking connection...
            </div>
          ) : dailyConnected ? (
            <div
              style={{
                ...connectionStatus,
                color: "#22c55e",
              }}
            >
              Connected
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
            <AcceptedConnections user={user} onAction={onAction} disabled={!callEnded} />
          </div>

        </div>
      )}

      {/* TIP */}
      {showThanks && (
        <SayThanksModal
          host={host || null}
          user={user}
          onTipSent={(amount) => {
            setTipEarned((current) => Number(current || 0) + Number(amount || 0));
          }}
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

function AcceptedConnections({ user, onAction, disabled }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadConnections() {
      if (!user?.id) {
        setContacts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setLoadError("");

      try {
        const { data: connections, error: connectionError } = await supabase
          .from("connections")
          .select("user_a,user_b,status")
          .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
          .eq("status", "accepted");

        if (connectionError) throw connectionError;

        const partnerIds = [...new Set(
          (connections || [])
            .map((item) => item.user_a === user.id ? item.user_b : item.user_a)
            .filter(Boolean)
        )];

        if (partnerIds.length === 0) {
          if (!cancelled) setContacts([]);
          return;
        }

        const { data: profiles, error: profileError } = await supabase
          .from("profiles")
          .select("user_id,alias,name,avatar_url")
          .in("user_id", partnerIds);

        if (profileError) throw profileError;

        const profileMap = new Map(
          (profiles || []).map((profile) => [profile.user_id, profile])
        );

        const result = partnerIds
          .map((id) => profileMap.get(id))
          .filter(Boolean)
          .sort((a, b) =>
            (a.alias || a.name || "").localeCompare(b.alias || b.name || "")
          );

        if (!cancelled) setContacts(result);
      } catch (error) {
        console.error("Failed to load call connections:", error);
        if (!cancelled) {
          setContacts([]);
          setLoadError("Couldn't load connections. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadConnections();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const contactRow = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 4px",
    borderBottom: "1px solid rgba(255,255,255,.07)",
  };

  const avatarStyle = {
    width: 40,
    height: 40,
    borderRadius: "50%",
    objectFit: "cover",
    flexShrink: 0,
    background: "rgba(255,255,255,.08)",
  };

  const callButtonStyle = {
    marginLeft: "auto",
    padding: "8px 13px",
    borderRadius: 999,
    border: "1px solid rgba(167,139,250,.4)",
    background: "rgba(124,58,237,.28)",
    color: "#fff",
    fontSize: 12,
    fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.45 : 1,
    flexShrink: 0,
  };

  if (loading) {
    return <div style={{ color: "#cbd5e1", padding: 12, fontSize: 13 }}>Loading connectionsâ€¦</div>;
  }

  if (loadError) {
    return <div style={{ color: "#fca5a5", padding: 12, fontSize: 13 }}>{loadError}</div>;
  }

  if (contacts.length === 0) {
    return <div style={{ color: "#cbd5e1", padding: 12, fontSize: 13 }}>No accepted connections yet.</div>;
  }

  return (
    <div>
      {disabled && (
        <div style={{
          color: "#cbd5e1",
          fontSize: 12,
          lineHeight: 1.5,
          padding: "2px 4px 10px",
        }}>
          End this call before starting another.
        </div>
      )}

      {contacts.map((profile) => (
        <div key={profile.user_id} style={contactRow}>
          <img
            src={profile.avatar_url || "https://placehold.co/100x100"}
            alt=""
            style={avatarStyle}
            loading="lazy"
          />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              color: "#fff",
              fontSize: 13,
              fontWeight: 650,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {profile.alias || profile.name || "UpCall member"}
            </div>
            <div style={{ color: "#94a3b8", fontSize: 11, marginTop: 3 }}>
              Connected
            </div>
          </div>
          <button
            type="button"
            style={callButtonStyle}
            disabled={disabled}
            onClick={() => onAction?.("call", profile)}
            title={disabled ? "End your current call first" : `Call ${profile.alias || profile.name || "connection"}`}
          >
            Call
          </button>
        </div>
      ))}
    </div>
  );
}
