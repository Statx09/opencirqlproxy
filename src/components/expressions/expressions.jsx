export const expressions = [

  // ================= TECHNOLOGY =================

  {
    id: "ai",
    label: "Artificial Intelligence",
    category: "Technology",
    svg: "ai",
    color: "#8B5CF6",
    keywords: ["artificial intelligence", "machine learning"],
  },
  {
    id: "developer",
    label: "Developer",
    category: "Technology",
    svg: "developer",
    color: "#3B82F6",
    keywords: ["coding", "software", "programming"],
  },
  {
    id: "crypto",
    label: "Crypto",
    category: "Technology",
    svg: "crypto",
    color: "#F7931A",
    keywords: ["bitcoin", "blockchain"],
  },
  {
    id: "cloud",
    label: "Cloud",
    category: "Technology",
    svg: "cloud",
    color: "#38BDF8",
  },
  {
    id: "linux",
    label: "Linux",
    category: "Technology",
    svg: "linux",
    color: "#FACC15",
  },
  {
    id: "robotics",
    label: "Robotics",
    category: "Technology",
    svg: "robotics",
    color: "#14B8A6",
  },
  {
    id: "opensource",
    label: "Open Source",
    category: "Technology",
    svg: "developer",
    color: "#22C55E",
  },
  {
    id: "privacy",
    label: "Privacy",
    category: "Technology",
    svg: "linux",
    color: "#64748B",
  },


  // ================= LIFESTYLE =================

  {
    id: "coffee",
    label: "Coffee",
    category: "Lifestyle",
    svg: "coffee",
    color: "#B45309",
  },
  {
    id: "travel",
    label: "Travel",
    category: "Lifestyle",
    svg: "travel",
    color: "#0EA5E9",
  },
  {
    id: "surf",
    label: "Surfing",
    category: "Lifestyle",
    svg: "surf",
    color: "#06B6D4",
  },
  {
    id: "fitness",
    label: "Fitness",
    category: "Lifestyle",
    svg: "gym",
    color: "#EF4444",
  },
  {
    id: "cars",
    label: "Cars",
    category: "Lifestyle",
    svg: "car",
    color: "#3B82F6",
  },
  {
    id: "books",
    label: "Books",
    category: "Lifestyle",
    svg: "book",
    color: "#F59E0B",
  },
  {
    id: "plants",
    label: "Plants",
    category: "Lifestyle",
    svg: "world",
    color: "#22C55E",
  },
  {
    id: "hiking",
    label: "Hiking",
    category: "Lifestyle",
    svg: "travel",
    color: "#10B981",
  },
  {
    id: "vanlife",
    label: "Van Life",
    category: "Lifestyle",
    svg: "travel",
    color: "#F97316",
  },


  // ================= CREATIVE =================

  {
    id: "creative",
    label: "Creative",
    category: "Creative",
    svg: "art",
    color: "#EC4899",
  },
  {
    id: "art",
    label: "Art",
    category: "Creative",
    svg: "art",
    color: "#EC4899",
  },
  {
    id: "design",
    label: "Design",
    category: "Creative",
    svg: "design",
    color: "#A855F7",
  },
  {
    id: "camera",
    label: "Photography",
    category: "Creative",
    svg: "camera",
    color: "#0EA5E9",
  },


  // ================= PROFESSIONAL =================

  {
    id: "entrepreneur",
    label: "Entrepreneur",
    category: "Professional",
    svg: "startup",
    color: "#F97316",
    keywords: ["founder", "business", "startup"],
  },
  {
    id: "business",
    label: "Business",
    category: "Professional",
    svg: "business",
    color: "#0EA5E9",
  },
  {
    id: "networking",
    label: "Networking",
    category: "Professional",
    svg: "world",
    color: "#22C55E",
  },
  {
    id: "teacher",
    label: "Teacher",
    category: "Community",
    svg: "teacher",
    color: "#10B981",
  },


  // ================= ENTERTAINMENT =================

  {
    id: "gaming",
    label: "Gaming",
    category: "Entertainment",
    svg: "gaming",
    color: "#10B981",
  },
  {
    id: "anime",
    label: "Anime",
    category: "Entertainment",
    svg: "gaming",
    color: "#EC4899",
  },
  {
    id: "music",
    label: "Music",
    category: "Entertainment",
    svg: "music",
    color: "#EC4899",
  },
  {
    id: "football",
    label: "Football",
    category: "Sports",
    svg: "sports",
    color: "#EAB308",
  },

];


export function getExpression(id) {
  return expressions.find((e) => e.id === id);
}


export function searchExpressions(query) {
  if (!query) return expressions;

  const q = query.toLowerCase();

  return expressions.filter(
    (e) =>
      e.label.toLowerCase().includes(q) ||
      e.id.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) ||
      (e.keywords || []).some((k) =>
        k.toLowerCase().includes(q)
      )
  );
}