import { supabase } from "./supabaseClient";

const mockHosts = [
  {
    name: "Jaden",
    avatar_url: "https://i.pravatar.cc/150?img=11",
  },
  {
    name: "Jay Lee",
    avatar_url: "https://i.pravatar.cc/150?img=12",
  },
  {
    name: "Sarah",
    avatar_url: "https://i.pravatar.cc/150?img=32",
  },
  {
    name: "Michael",
    avatar_url: "https://i.pravatar.cc/150?img=15",
  },
  {
    name: "Emma",
    avatar_url: "https://i.pravatar.cc/150?img=24",
  },
];

const expressions = [
  {
    expression: "social",
    content: "👋 Looking for interesting conversations today.",
  },
  {
    expression: "curious",
    content: "🌍 Anyone working on something exciting?",
  },
  {
    expression: "podcast",
    content: "🎙️ Looking for a podcast guest.",
  },
  {
    expression: "networking",
    content: "🤝 Happy to meet new people.",
  },
  {
    expression: "coffee",
    content: "☕ Who wants to chat over coffee?",
  },
  {
    expression: "ideas",
    content: "💡 Brainstorming new startup ideas.",
  },
  {
    expression: "creative",
    content: "🎨 Feeling creative today.",
  },
  {
    expression: "help",
    content: "🙌 Happy to help anyone who needs advice.",
  },
];

export function startMockStatusFeed() {
  console.log("🔥 Mock Status Feed Started");

  let timer;

  const insertStatus = async () => {
    const host =
      mockHosts[Math.floor(Math.random() * mockHosts.length)];

    const exp =
      expressions[Math.floor(Math.random() * expressions.length)];

    const payload = {
      name: host.name,
      avatar_url: host.avatar_url,
      content: exp.content,
      expression: exp.expression,
      created_at: new Date().toISOString(),
    };

    console.log("INSERTING:", payload);

    const { data, error } = await supabase
      .from("status_feed")
      .insert(payload)
      .select();

    console.log("INSERT RESULT:", data);
    console.log("INSERT ERROR:", error);
  };

  // Insert immediately
  insertStatus();

  // Then every 5 seconds
  timer = setInterval(insertStatus, 5000);

  return () => clearInterval(timer);
}