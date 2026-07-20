import React from "react";
import ModalShell from "../ui/ModalShell";
import LiveComposer from "./LiveComposer";
import LiveFeed from "./LiveFeed";

export default function LiveModal({
  user,
  statuses = [],
  onClose,
  onOpenProfile,
  refreshStatuses,
}) {
  return (
    <ModalShell
      title="Live"
      onClose={onClose}
    >
      <div style={container}>

        <LiveComposer
          user={user}
          onPosted={refreshStatuses}
        />

        <LiveFeed
          statuses={statuses}
          onOpenProfile={onOpenProfile}
        />

      </div>
    </ModalShell>
  );
}

const container = {
  display: "flex",
  flexDirection: "column",
  height: "100%",
};