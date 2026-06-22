import React from "react";
import ExpressionBadges from "./badges/ExpressionBadges";
import useHostActions from "../hooks/useHostActions";

export default function MiniHostCard(props) {
  const {
    host,
    user,
    sendHostEvent,
    openMessageModal,
    openCallModal,
    openTipModal,
  } = props;

  const actions = useHostActions({
    host,
    user,
    sendHostEvent,
    openMessageModal,
    openCallModal,
    openTipModal,
  });

  return (
    <div style={card}>
      <div style={avatar} />

      <div style={info}>
        <div>{host.name}</div>

        {/* BADGES */}
        <ExpressionBadges badges={host.expression_badges} />

        {/* QUICK ACTIONS */}
        <div style={actionsRow}>
          <button onClick={actions.wave}>👋</button>
          <button onClick={actions.like}>❤️</button>
        </div>
      </div>
    </div>
  );
}

const card = {};
const avatar = {};
const info = {};
const actionsRow = {};