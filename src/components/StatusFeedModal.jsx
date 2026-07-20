import React from "react";
import { supabase } from "../lib/supabaseClient";

import ModalShell from "./ui/ModalShell";
import LiveComposer from "./live/LiveComposer";
import LiveFeed from "./live/LiveFeed";


export default function StatusFeedModal({
  statuses = [],
  onClose,
  onOpenProfile,
}) {


  const handlePost = async ({ content, expression }) => {

    console.log("Posting...", {
      content,
      expression,
    });


    const {
      data: { user },
    } = await supabase.auth.getUser();


    if (!user) {
      console.log("No user");
      return;
    }


    const { data, error } = await supabase
      .from("live_statuses")
      .insert({
        user_id: user.id,
        content,
        expression,
        created_at: new Date().toISOString(),
        expires_at: new Date(
          Date.now() + 6 * 60 * 60 * 1000
        ).toISOString(),
      })
      .select();


    console.log("INSERT DATA:", data);
    console.log("INSERT ERROR:", error);
  };


  return (
    <ModalShell
      title="Status Feed"
      onClose={onClose}
    >

      <div style={container}>


        <div style={feedWrap}>

          <LiveFeed
            statuses={statuses}
            onOpenProfile={onOpenProfile}
          />

        </div>



        <div style={composerWrap}>

          <LiveComposer
            onPost={handlePost}
          />

        </div>


      </div>

    </ModalShell>
  );

}



/* ================= STYLES ================= */


const container = {

  flex: 1,

  display: "flex",

  flexDirection: "column",

  height: "100%",

};



const feedWrap = {

  flex: 1,

  overflowY: "auto",

  paddingBottom: 20,

};



const composerWrap = {

  padding: 12,

  borderTop:
    "1px solid rgba(255,255,255,.08)",

  background:
    "rgba(11,18,32,.85)",

  backdropFilter:
    "blur(18px)",

  zIndex: 10,

};