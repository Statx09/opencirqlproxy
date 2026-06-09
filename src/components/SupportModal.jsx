import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function SupportModal({ host, user, onClose }) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleSupport = async (method) => {
    if (!user?.id) {
      alert("Please login to support.");
      return;
    }

    setLoading(true);

    try {
      // ---------------- PAYPAL / KO-FI (OPEN LINK) ----------------
      if (method.type === "link") {
        if (!method.value) {
          alert("This user has not set this payment method.");
          setLoading(false);
          return;
        }

        window.open(method.value, "_blank", "noopener,noreferrer");
      }

      // ---------------- CRYPTO (COPY ADDRESS) ----------------
      else if (method.type === "crypto") {
        if (!method.value) {
          alert("No crypto address set.");
          setLoading(false);
          return;
        }

        await navigator.clipboard.writeText(method.value);
        alert("Crypto address copied");
      }

      // ---------------- WALLET (COPY ADDRESS) ----------------
      else if (method.type === "wallet") {
        if (!method.value) {
          alert("No wallet address set.");
          setLoading(false);
          return;
        }

        await navigator.clipboard.writeText(method.value);
        alert("Wallet address copied");
      }

      // ---------------- LOG SUPPORT EVENT ----------------
      await supabase.from("opencall_supports").insert([
        {
          user_id: user.id,
          host_id: host?.user_id,
          method: method.id,
        },
      ]);

      setStep(2);
    } catch (err) {
      console.error(err);
      alert("Support failed. Please try again.");
    }

    setLoading(false);
  };

  // ---------------- BUTTON BUILD (SAFE + SIMPLE) ----------------
  const buttons = [
    host?.paypal_link && {
      id: "paypal",
      label: "💙 PayPal",
      type: "link",
      value: host.paypal_link,
    },

    host?.kofi && {
      id: "kofi",
      label: "☕ Ko-fi",
      type: "link",
      value: host.kofi,
    },

    host?.crypto_link && {
      id: "crypto",
      label: "⚡ Crypto Wallet",
      type: "crypto",
      value: host.crypto_link,
    },

    host?.usdt_wallet && {
      id: "usdt",
      label: "🧾 USDT Wallet",
      type: "wallet",
      value: host.usdt_wallet,
    },
  ].filter(Boolean);

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>

        {/* CLOSE */}
        <button onClick={onClose} style={closeBtn}>
          ✕
        </button>

        {/* HEADER (restored clean + neutral) */}
        <h2 style={{ marginBottom: 6 }}>
          Support {host?.alias || "User"}
        </h2>

        <p style={subText}>
          Choose a payment method below to support this user directly.
        </p>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <div style={buttonRow}>
              {buttons.length === 0 && (
                <p style={smallText}>
                  No payment methods available.
                </p>
              )}

              {buttons.map((btn) => (
                <button
                  key={btn.id}
                  style={btnStyle}
                  onClick={() => handleSupport(btn)}
                  disabled={loading}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div style={{ marginTop: 20 }}>
            <h3>Thank you 💛</h3>
            <p style={smallText}>
              Support action completed.
            </p>

            <button style={btnStyle} onClick={onClose}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= STYLES (same vibe as before) ================= */

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.7)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const modal = {
  width: "92%",
  maxWidth: 420,
  background: "#111827",
  borderRadius: 16,
  padding: 20,
  color: "#fff",
  position: "relative",
};

const closeBtn = {
  position: "absolute",
  right: 10,
  top: 10,
  background: "#000",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "6px 10px",
  cursor: "pointer",
};

const subText = {
  fontSize: 13,
  color: "#aaa",
  marginBottom: 16,
};

const smallText = {
  fontSize: 12,
  color: "#888",
  marginTop: 10,
};

const buttonRow = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const btnStyle = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "none",
  background: "#7c3aed",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};