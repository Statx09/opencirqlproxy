import React, { useState, useEffect } from "react";

export default function ReferralCommissionTab({ user }) {
  const [referrals, setReferrals] = useState([
    // example data
    { name: "Alice", joined: "2026-01-01", commission: 0.5 },
    { name: "Bob", joined: "2026-01-05", commission: 1.0 },
  ]);

  const totalCommission = referrals.reduce((sum, r) => sum + r.commission, 0);

  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
      <h2 style={{ fontFamily: "Arial, sans-serif", fontWeight: 700, color: "#111827", marginBottom: 16 }}>
        Referral Commissions
      </h2>

      <p style={{ marginBottom: 16, fontWeight: 600 }}>
        Total Earnings: <span style={{ color: "#22c55e" }}>${totalCommission.toFixed(2)}</span>
      </p>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "2px solid #e5e7eb" }}>
            <th style={{ padding: "8px 4px" }}>Name</th>
            <th style={{ padding: "8px 4px" }}>Joined</th>
            <th style={{ padding: "8px 4px" }}>Commission ($)</th>
          </tr>
        </thead>
        <tbody>
          {referrals.map((r, idx) => (
            <tr key={idx} style={{ borderBottom: "1px solid #e5e7eb" }}>
              <td style={{ padding: "8px 4px" }}>{r.name}</td>
              <td style={{ padding: "8px 4px" }}>{r.joined}</td>
              <td style={{ padding: "8px 4px", color: "#22c55e", fontWeight: 600 }}>{r.commission.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        style={{
          marginTop: 16,
          padding: "10px 20px",
          borderRadius: 8,
          backgroundColor: "#3b82f6",
          color: "#fff",
          fontWeight: 600,
          border: "none",
          cursor: "pointer",
        }}
        onClick={() => alert("Withdraw to wallet/Kofi (Demo)")}
      >
        Withdraw
      </button>
    </div>
  );
}


