import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function SayThanksModal({ host, onClose }) {
  const [amount, setAmount] = useState(3);
  const [balance, setBalance] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const name = host?.alias || host?.name || "creator";
  const hostUserId = host?.user_id;

  const remainingBalance = useMemo(() => {
    if (balance == null) return null;
    return Number(balance) - Number(amount);
  }, [balance, amount]);

  useEffect(() => {
    let cancelled = false;

    const loadBalance = async () => {
      setLoadingBalance(true);
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (userError || !user?.id) {
        setError("Please sign in to use your wallet.");
        setLoadingBalance(false);
        return;
      }

      const { data, error: balanceError } = await supabase
        .from("profiles")
        .select("balance")
        .eq("user_id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (balanceError) {
        console.error("TIP BALANCE ERROR", balanceError);
        setError("Unable to load your wallet balance.");
        setLoadingBalance(false);
        return;
      }

      setBalance(Number(data?.balance ?? 0));
      setLoadingBalance(false);
    };

    loadBalance();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleTip = async () => {
    if (sending || success) return;

    setError("");

    if (!hostUserId) {
      setError("This profile cannot receive tips right now.");
      return;
    }

    if (balance == null) {
      setError("Your wallet balance is still loading.");
      return;
    }

    if (Number(balance) < Number(amount)) {
      setError("INSUFFICIENT_BALANCE");
      return;
    }

    setSending(true);

    const { data, error: tipError } = await supabase.rpc("tip_host", {
      p_host_user_id: hostUserId,
      p_amount: amount,
    });

    if (tipError) {
      console.error("TIP ERROR", tipError);

      const message = tipError.message || "";

      if (message.includes("INSUFFICIENT_BALANCE")) {
        setError("INSUFFICIENT_BALANCE");
      } else if (message.includes("CANNOT_TIP_SELF")) {
        setError("You cannot tip yourself.");
      } else if (message.includes("NOT_AUTHENTICATED")) {
        setError("Please sign in to use your wallet.");
      } else {
        setError("Tip could not be completed. Please try again.");
      }

      setSending(false);
      return;
    }

    console.log("TIP SUCCESS", data);

    setBalance(Number(data?.caller_balance ?? remainingBalance ?? 0));
    setSuccess(true);
    setSending(false);
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        {/* HEADER */}
        <div style={header}>
          <h2 style={{ margin: 0 }}>Say Thanks 💛</h2>

          <button onClick={onClose} style={closeBtn} disabled={sending}>
            ✕
          </button>
        </div>

        <p style={{ fontSize: 13, color: "#555" }}>
          Send {name} a tip from your UpCall wallet.
        </p>

        {success ? (
          <div style={successBox}>
            <div style={successTitle}>Tip sent 💛</div>

            <div style={successText}>
              ${Number(amount).toFixed(2)} was sent to {name}.
            </div>

            <div style={balanceBox}>
              Remaining balance
              <strong>${Number(balance ?? 0).toFixed(2)}</strong>
            </div>

            <button onClick={onClose} style={payBtn}>
              Done
            </button>
          </div>
        ) : (
          <>
            {/* AMOUNT */}
            <div style={section}>
              <p style={label}>Amount</p>

              <div style={row}>
                {[1, 3, 5, 10].map((v) => (
                  <button
                    key={v}
                    onClick={() => {
                      setAmount(v);
                      setError("");
                    }}
                    disabled={sending}
                    style={{
                      ...btn,
                      background: amount === v ? "#7c3aed" : "#eee",
                      color: amount === v ? "#fff" : "#111",
                      opacity: sending ? 0.6 : 1,
                    }}
                  >
                    ${v}
                  </button>
                ))}
              </div>
            </div>

            {/* BALANCE */}
            <div style={balanceBox}>
              <span>Your wallet balance</span>

              <strong>
                {loadingBalance
                  ? "Loading..."
                  : `$${Number(balance ?? 0).toFixed(2)}`}
              </strong>
            </div>

            {/* REMAINING */}
            {!loadingBalance && balance != null && (
              <div style={remainingBox}>
                <span>After this tip</span>

                <strong
                  style={{
                    color: remainingBalance < 0 ? "#dc2626" : "#111",
                  }}
                >
                  ${Math.max(remainingBalance, 0).toFixed(2)}
                </strong>
              </div>
            )}

            {/* ERROR */}
            {error && (
              <div style={errorBox}>
                {error === "INSUFFICIENT_BALANCE"
                  ? "Insufficient wallet balance for this tip."
                  : error}
              </div>
            )}

            {/* ACTION */}
            <button
              onClick={handleTip}
              disabled={
                sending ||
                loadingBalance ||
                balance == null ||
                Number(balance) < Number(amount)
              }
              style={{
                ...payBtn,
                opacity:
                  sending ||
                  loadingBalance ||
                  balance == null ||
                  Number(balance) < Number(amount)
                    ? 0.55
                    : 1,
              }}
            >
              {sending
                ? "Sending..."
                : `Confirm $${Number(amount).toFixed(2)} Tip`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const modal = {
  width: 420,
  maxWidth: "calc(100vw - 32px)",
  background: "#fff",
  borderRadius: 16,
  padding: 16,
  boxSizing: "border-box",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const closeBtn = {
  border: "none",
  background: "#111827",
  color: "#fff",
  width: 30,
  height: 30,
  borderRadius: "50%",
  cursor: "pointer",
};

const section = {
  marginTop: 12,
};

const label = {
  fontSize: 13,
  fontWeight: 700,
  marginBottom: 6,
};

const row = {
  display: "flex",
  gap: 8,
};

const btn = {
  flex: 1,
  padding: 10,
  borderRadius: 10,
  border: "none",
  cursor: "pointer",
  fontWeight: 700,
};

const balanceBox = {
  marginTop: 12,
  padding: 12,
  borderRadius: 10,
  background: "#f3f4f6",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontSize: 13,
};

const remainingBox = {
  marginTop: 8,
  padding: 12,
  borderRadius: 10,
  background: "#fafafa",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontSize: 13,
};

const errorBox = {
  marginTop: 10,
  padding: 10,
  borderRadius: 10,
  background: "#fef2f2",
  color: "#b91c1c",
  fontSize: 13,
  fontWeight: 600,
};

const successBox = {
  marginTop: 16,
};

const successTitle = {
  fontSize: 18,
  fontWeight: 800,
  color: "#16a34a",
};

const successText = {
  marginTop: 6,
  fontSize: 14,
  color: "#374151",
};

const payBtn = {
  marginTop: 14,
  width: "100%",
  padding: 12,
  borderRadius: 12,
  border: "none",
  background: "#7c3aed",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};
