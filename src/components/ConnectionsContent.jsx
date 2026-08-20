import React, { useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { supabase } from "../lib/supabaseClient";
import ConnectionRequests from "./ConnectionRequests";
import ProfileModal from "./ProfileModal";

export default function ConnectionsContent({
  user,
  onClose,
  onOpenProfile,
}) {
  const { theme } = useTheme();

  const [connections, setConnections] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState(null);

  const loadConnections = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("connections")
      .select("*")
      .eq("status", "accepted")
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("LOAD CONNECTIONS ERROR:", error);
      setLoading(false);
      return;
    }

    const rows = data || [];
    setConnections(rows);

    const otherUserIds = rows
      .map((connection) =>
        connection.user_a === user.id
          ? connection.user_b
          : connection.user_a
      )
      .filter(Boolean);

    if (!otherUserIds.length) {
      setProfiles({});
      setLoading(false);
      return;
    }

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .in("user_id", otherUserIds);

    if (profileError) {
      console.error("LOAD CONNECTION PROFILES ERROR:", profileError);
    }

    const profileMap = {};

    (profileData || []).forEach((profile) => {
      profileMap[profile.user_id] = profile;
    });

    setProfiles(profileMap);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  if (!user) return null;

  return (
    <>
      <div
        style={overlay}
        onClick={onClose}
      >
        <div
          style={{
            ...modal,
            background: theme.background,
            color: theme.text,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              ...header,
              borderBottomColor: theme.border,
            }}
          >
            <div style={headerLeft}>
              <div>
                <h3 style={{ margin: 0 }}>Connections</h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{
                ...closeBtn,
                background: theme.surface,
                color: theme.text,
                border: `1px solid ${theme.border}`,
              }}
            >
              <X size={20} />
            </button>
          </div>

          <div
            style={{
              ...content,
              background: theme.background,
            }}
          >
            <ConnectionRequests
              user={user}
              onUpdated={loadConnections}
              onOpenProfile={onOpenProfile}
            />

            {loading ? (
              <div style={emptyState}>
                Loading...
              </div>
            ) : (
              <div>
                {connections.map((connection) => {
                  const otherUserId =
                    connection.user_a === user.id
                      ? connection.user_b
                      : connection.user_a;

                  const profile = profiles[otherUserId];

                  if (!profile) return null;

                  const displayName =
                    profile.alias ||
                    profile.name ||
                    "User";

                  const avatar =
                    profile.avatar_url ||
                    profile.avatar ||
                    "https://placehold.co/100";

                  return (
                    <button
                      key={connection.id}
                      type="button"
                      onClick={() => setSelectedProfile(profile)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 4px",
                        margin: 0,
                        border: "none",
                        borderBottom: `1px solid ${theme.border}`,
                        background: "transparent",
                        color: theme.text,
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <img
                        src={avatar}
                        alt={displayName}
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: "50%",
                          objectFit: "cover",
                          flexShrink: 0,
                        }}
                      />

                      <div
                        style={{
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 14,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {displayName}
                        </div>

                        <div
                          style={{
                            fontSize: 12,
                            opacity: 0.6,
                            marginTop: 2,
                          }}
                        >
                          Connected
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {!loading && connections.length === 0 && (
              <div style={emptyState}>
                No connections yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedProfile && (
        <ProfileModal
          host={selectedProfile}
          onClose={() => setSelectedProfile(null)}
        />
      )}
    </>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 100002,
};

const modal = {
  width: "100%",
  maxWidth: 700,
  height: "100dvh",
  maxHeight: "100dvh",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

const header = {
  padding: 16,
  borderBottom: "1px solid #eee",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexShrink: 0,
};

const headerLeft = {
  display: "flex",
  alignItems: "center",
};

const closeBtn = {
  width: 34,
  height: 34,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

const content = {
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
  padding: "4px 16px 24px",
};

const emptyState = {
  textAlign: "center",
  padding: 30,
  opacity: 0.6,
  fontSize: 13,
};



