import React, { useState } from "react";
import HostCards from "./HostCards";
import RequestCards from "./RequestCards";
import Onboarding from "./Onboarding";

export default function Tabs() {
  const [active, setActive] = useState("hosts");

  return (
    <div>
      <div className="tab-buttons">
        <button onClick={() => setActive("hosts")}>Hosts</button>
        <button onClick={() => setActive("requests")}>Requests</button>
        <button onClick={() => setActive("onboarding")}>Onboarding</button>
      </div>
      <div className="tab-content">
        {active === "hosts" && <HostCards />}
        {active === "requests" && <RequestCards />}
        {active === "onboarding" && <Onboarding />}
      </div>
    </div>
  );
}
