import React from "react";
import HostCards from "../HostCards";

export default function HostsPage({ hosts }) {
  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ textAlign: "center" }}>Available Hosts</h2>
      <HostCards hosts={hosts} />
    </div>
  );
}
