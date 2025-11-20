import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export default function RequestCards() {
  const [requests, setRequests] = useState([]);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    fetchRequests();
  }, [keyword]);

  const fetchRequests = async () => {
    let query = supabase.from("requests").select("*");
    if (keyword.trim() !== "") query = query.ilike("keyword", `%${keyword}%`);
    const { data, error } = await query;
    if (error) console.error(error);
    else setRequests(data);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search by keyword…"
        value={keyword}
        onChange={e => setKeyword(e.target.value)}
      />
      {requests.length === 0 ? (
        <p>No requests found.</p>
      ) : (
        requests.map((r, idx) => (
          <div key={idx} className="request-card">
            <h3>{r.title}</h3>
            <p>Keyword: {r.keyword}</p>
            <p>{r.details}</p>
          </div>
        ))
      )}
    </div>
  );
}
