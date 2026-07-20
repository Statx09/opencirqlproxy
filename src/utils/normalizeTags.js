export function normalizeTags(input) {
  if (!input) return [];

  if (Array.isArray(input)) {
    return input.filter(Boolean).map(String);
  }

  return String(input)
    .replace(/[{}"]/g, "")
    .split(",")
    .map(t => t.trim())
    .filter(Boolean);
}