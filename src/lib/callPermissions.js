export function canCall(userId, hostId, connections = []) {
  if (!userId || !hostId) return false;

  // cannot call yourself
  if (userId === hostId) return false;

  // must be accepted connection
  return connections.some((c) => {
    const isMatch =
      (c.user_a === userId && c.user_b === hostId) ||
      (c.user_b === userId && c.user_a === hostId);

    return isMatch && c.status === "accepted";
  });
}