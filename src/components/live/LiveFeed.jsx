import React from "react";
import ExpressionBadges from "../expressions/ExpressionBadges";

export default function LiveFeed({
  statuses = [],
  onOpenProfile,
}) {

  console.log("LIVEFEED STATUSES:", statuses);

  if (!statuses.length) {
    return (
      <div style={empty}>
        No statuses yet. Be the first to post.
      </div>
    );
  }


  return (
    <div style={feed}>

      {statuses.map((status) => {


        console.log(
          "STATUS OBJECT:",
          status
        );


        const profile =
          status.profile ||
          status.profiles ||
          null;


        console.log(
          "PROFILE OBJECT:",
          profile
        );



        const avatar =
          profile?.avatar_url ||
          "https://i.pravatar.cc/150";



        const name =
          profile?.name ||
          "Anonymous";



        const expressions =
          profile?.expressions ||
          [];



        return (

          <div
            key={status.id}
            style={card}

            onClick={() => {

              console.log(
                "Opening profile:",
                status.user_id
              );

              onOpenProfile?.(
                status.user_id
              );

            }}

          >


            {/* AVATAR */}

            <img
              src={avatar}
              alt={name}
              style={avatarStyle}
            />



            {/* CONTENT */}

            <div style={body}>


              <div style={topRow}>


                <div style={identity}>


                  <div style={nameStyle}>
                    {name}
                  </div>



                  {expressions.length > 0 && (

                    <ExpressionBadges
                      badges={expressions}
                      max={3}
                      size={22}
                    />

                  )}


                </div>



                <div style={time}>
                  2m
                </div>


              </div>





              <div style={content}>
                {status.content}
              </div>



            </div>


          </div>

        );

      })}


    </div>
  );
}



/* ====================== STYLES ====================== */


const feed = {

  display: "flex",

  flexDirection: "column",

  gap: 12,

  padding: 16,

};



const card = {

  display: "flex",

  gap: 14,

  padding: 14,

  borderRadius: 16,

  cursor: "pointer",

  background:
    "rgba(255,255,255,.06)",

  border:
    "1px solid rgba(255,255,255,.08)",

  transition:
    "0.2s ease",

  backdropFilter:
    "blur(18px)",

  boxShadow:
    "0 12px 30px rgba(0,0,0,.22)",

};



const avatarStyle = {

  width: 52,

  height: 52,

  borderRadius: "50%",

  objectFit: "cover",

  flexShrink: 0,

};



const body = {

  flex: 1,

};



const topRow = {

  display: "flex",

  justifyContent: "space-between",

  alignItems: "center",

};



const identity = {

  display: "flex",

  alignItems: "center",

  gap: 8,

};



const nameStyle = {

  color: "#fff",

  fontWeight: 700,

  fontSize: 15,

};



const time = {

  color: "#9ca3af",

  fontSize: 12,

  fontWeight: 500,

};



const content = {

  marginTop: 10,

  color: "#f3f4f6",

  fontSize: 15,

  lineHeight: 1.6,

};



const empty = {

  padding: 60,

  textAlign: "center",

  color: "#777",

};