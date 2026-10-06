import React, { useMemo, useState } from "react";
import TopicSearchBar from "./TopicSearchBar";
import { expressions } from "./expressions/expressions";
import MiniHostCard from "./MiniHostCard";
import HeroCallCard from "./HeroCallCard";
import { normalizeHost } from "../utils/normalizeHost";
import { useTheme } from "../context/ThemeContext";
import { ArrowLeftRight, Video } from "lucide-react";

export default function DiscoveryPage({
  user,
  hosts = [],
  onAction,
  statuses = [],
  mode,
  onToggleMode,
  onOpenPulse,
  onOpenCallsStudio,
  incomingCall,
  outgoingCall,
}) {
  const { theme } = useTheme();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  // Session-only dismissed cards
  const [dismissedIds, setDismissedIds] = useState([]);
  const [activeSwipe, setActiveSwipe] = useState(null);
  const [exitingId, setExitingId] = useState(null);

  const handleSwipeStart = (e, id) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;

    e.currentTarget.setPointerCapture?.(e.pointerId);

    setActiveSwipe({
      id,
      startX: e.clientX,
      x: 0,
    });
  };

  const handleSwipeMove = (e, id) => {
    if (!activeSwipe || activeSwipe.id !== id) return;

    const x = e.clientX - activeSwipe.startX;

    setActiveSwipe((current) =>
      current ? { ...current, x } : current
    );
  };

  const handleSwipeEnd = (e, id) => {
    if (!activeSwipe || activeSwipe.id !== id) return;

    const x = activeSwipe.x;
    const threshold = 90;

    if (Math.abs(x) >= threshold) {
      const direction = x > 0 ? 1 : -1;

      setExitingId(id);

      setActiveSwipe({
        id,
        startX: e.clientX,
        x: direction * window.innerWidth,
      });

      window.setTimeout(() => {
        setDismissedIds((current) =>
          current.includes(id) ? current : [...current, id]
        );

        setExitingId(null);
        setActiveSwipe(null);
      }, 220);

      return;
    }

    setActiveSwipe(null);
  };
  const filtered = useMemo(() => {
  const q = query.toLowerCase();

  const result = hosts
    .map(normalizeHost)
    .filter((h) => {
      const name = h.name?.toLowerCase() || "";
      const topics = (h.topics || []).join(" ").toLowerCase();
      const intents = (h.intents || []).join(" ").toLowerCase();

      const matchesSearch =
        name.includes(q) ||
        topics.includes(q) ||
        intents.includes(q) ||
        (h.expressions || []).some((e) => String(e).toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (filter === "all") return true;

      const filterMap = {
        ai_hosts: [
          "ai",
          "artificial intelligence",
          "ai host",
          "ai hosts",
        ],

        social: [
          "friendship",
          "social",
          "community",
        ],

        professionals: [
          "professional",
          "professionals",
          "expert",
          "expertise",
          "specialist",
          "career",
          "business",
        ],

        consulting: [
          "consulting",
          "consultant",
          "advisor",
          "advisory",
          "expertise",
        ],

        opportunities: [
          "opportunity",
          "opportunities",
          "recruiting",
          "recruiter",
          "recruitment",
          "hiring",
          "employer",
          "talent",
          "investment",
          "investments",
          "investing",
          "make money",
          "making money",
          "income",
          "earn",
          "earning",
          "monetize",
          "monetization",
          "side hustle",
        ],

        collaboration: [
          "collaboration",
          "collaborate",
          "partnership",
          "partnerships",
          "project",
          "projects",
        ],

        languages: [
          "language",
          "languages",
          "language exchange",
          "translation",
          "translator",
        ],

        support: [
          "support",
          "help",
          "advice",
          "guidance",
          "mentoring",
          "mentor",
        ],

        podcasting: [
          "podcast",
          "podcasting",
          "podcaster",
        ],

        promotion: [
          "promotion",
          "promote",
          "marketing",
          "exposure",
          "promotion services",
        ],

        freelancers: [
          "freelance",
          "freelancer",
          "freelancers",
          "contractor",
          "available for work",
        ],
      };

      const keywords = filterMap[filter] || [];

      const searchableText = `${name} ${topics} ${intents}`;

      return keywords.some((keyword) =>
        searchableText.includes(keyword)
      );
    });

    console.log(
      "FILTERED:",
      result.map((h) => ({
        alias: h.alias,
        name: h.name,
      }))
    );

    return result;
    }, [hosts, query, filter]);

  return (
    <div style={page(theme)}>
      <style>{`
        @keyframes callStudioGlow {
          0%, 100% {
            box-shadow:
              0 0 0 1px rgba(34,197,94,.45),
              0 0 8px rgba(34,197,94,.16),
              0 5px 14px rgba(0,0,0,.16);
          }
          50% {
            box-shadow:
              0 0 0 2px rgba(34,197,94,.75),
              0 0 16px rgba(34,197,94,.30),
              0 5px 14px rgba(0,0,0,.16);
          }
        }

        .call-studio-button {
          border: 1px solid rgba(34,197,94,.8) !important;
          animation: callStudioGlow 3s ease-in-out infinite;
        }
      `}</style>
      <div style={header}>

        <div style={topRow}>

          <button
            type="button"
            aria-label={mode === "grid" ? "Swipe View" : "Grid View"}
            title={mode === "grid" ? "Swipe View" : "Grid View"}
            style={topButton(theme)}
            onClick={onToggleMode}
          >
            <ArrowLeftRight size={19} strokeWidth={2.2} />
          </button>

          <button
            type="button"
            aria-label="Call Studio"
            title="Call Studio"
            className="call-studio-button"
            onClick={onOpenCallsStudio}
             style={{ ...topButton(theme), ...(incomingCall || outgoingCall ? { border: "1px solid rgba(34,197,94,.95)", boxShadow: "0 0 0 2px rgba(34,197,94,.45), 0 0 22px rgba(34,197,94,.45), 0 5px 14px rgba(0,0,0,.16)" } : {}) }}
          >
            <Video size={19} strokeWidth={2.2} />
          </button>

        </div>

        <TopicSearchBar
  value={query}
  onChange={setQuery}
  filter={filter}
  onFilterChange={setFilter}
/>

      </div>

      <div style={grid}>
    {filtered
      .filter((host) => !dismissedIds.includes(host.id))
      .map((host) => {
        const isActive = activeSwipe?.id === host.id;
        const x = isActive ? activeSwipe.x : 0;
        const isExiting = exitingId === host.id;

        return (
          <div
            key={host.id}
            style={{
              ...swipeItem,
              transform: `translateX(${x}px) rotate(${x * 0.025}deg)`,
              opacity: isExiting ? 0 : 1,
              transition:
                isActive && !isExiting
                  ? "none"
                  : "transform .22s ease, opacity .22s ease",
            }}
            onPointerDown={(e) => handleSwipeStart(e, host.id)}
            onPointerMove={(e) => handleSwipeMove(e, host.id)}
            onPointerUp={(e) => handleSwipeEnd(e, host.id)}
            onPointerCancel={(e) => handleSwipeEnd(e, host.id)}
          >
            <MiniHostCard
              host={host}
              user={user}
              onAction={onAction}
            />
          </div>
        );
      })}
  </div>

    </div>
  );
}

/* ================= STYLES ================= */

const page = (theme) => ({
  padding: "86px 18px 120px",
  background: theme.background,
  color: theme.text,
  minHeight: "100vh",
  transition: "all .25s ease",
});

const header = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  marginBottom: 10,
};

const swipeItem = {
  width: "100%",
  minWidth: 0,
  maxWidth: "100%",
  boxSizing: "border-box",
  overflow: "hidden",
  touchAction: "pan-y",
  userSelect: "none",
  WebkitUserSelect: "none",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  gap: 12,
  width: "100%",
  maxWidth: 520,
  minWidth: 0,
  boxSizing: "border-box",
  margin: "0 auto",
};

const topRow = {
  position: "relative",
  zIndex: 1,
  display: "flex",
  gap: 8,
  marginBottom: 6,
};

const topButton = (theme) => ({
  flex: 1,
  height: 34,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 9,
  background: theme.card,
  color: theme.text,
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  border: `1px solid ${theme.border}`,
  boxShadow:
    "0 0 0 1px rgba(96,165,250,.10), 0 0 12px rgba(59,130,246,.12), 0 5px 14px rgba(0,0,0,.16)",
  cursor: "pointer",
  transition:
    "transform .18s ease, box-shadow .18s ease, background .18s ease",
  WebkitTapHighlightColor: "transparent",
});


































