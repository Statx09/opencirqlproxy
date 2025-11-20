import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import HostCard from "./HostCard";

export default function HostCards() {
  const [hosts, setHosts] = useState([]);

  useEffect(() => {
    const fetchHosts = async () => {
      const { data, error } = await supabase.from("hosts").select("*");
      console.log("Hosts fetched:", data, error);

      if (!error) setHosts(data);
    };

    fetchHosts();
  }, []);

  return (
    <div
      className="host-cards"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "12px",
        justifyContent: "center"
      }}
    >
      {hosts.length === 0 ? (
        <p>No hosts yet.</p>
      ) : (
        hosts.map((host, idx) => <HostCard key={idx} host={host} />)
      )}
    </div>
  );
}
