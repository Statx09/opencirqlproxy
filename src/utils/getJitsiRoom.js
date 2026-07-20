export function getJitsiRoom(userId) {
  if (!userId) return null;

  // Permanent personal room for every Cirql user
  const roomName = `cirql-${userId}`;

  return {
    roomName,
    roomUrl: `https://meet.jit.si/${roomName}`,
  };
}