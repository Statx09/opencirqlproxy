import React from "react";
import HostCard from "./HostCard";

export default function HostGrid({ hosts }) {
  return (
    <div className="host-grid">
      {hosts.map((host) => (
        <HostCard key={host.id} host={host} />
      ))}
    </div>
  );
}
