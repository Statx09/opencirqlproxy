export function normalizeArray(field) {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  return String(field)
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}