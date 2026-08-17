import React, { useMemo, useState } from "react";
import TopicSearchBar from "./TopicSearchBar";
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
        intents.includes(q);

      if (!matchesSearch) return false;

      if (filter === "all") return true;

      const filterMap = {
        social: ["friendship", "social", "community"],
        dating: ["dating", "relationship", "romance"],
        networking: ["networking", "business", "professional"],
        services: ["consultant", "consulting", "freelance", "services"],
        promotion: ["promotion", "product", "marketing", "sales"],
        collaboration: ["collaboration", "partner", "project"],
        support: ["support", "help", "mentoring", "advice"],
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
            style={topButton(theme)}
            onClick={onOpenCallsStudio}
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
  padding: "10px 18px 120px",
  background: theme.background,
  color: theme.text,
  minHeight: "100vh",
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
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
  touchAction: "pan-y",
  userSelect: "none",
  WebkitUserSelect: "none",
};
const grid = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 12,
  maxWidth: 520,
  margin: "0 auto",
};

const topRow = {
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





















