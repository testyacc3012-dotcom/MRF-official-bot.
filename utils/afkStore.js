// In-memory is fine here — AFK status is meant to be short-lived, and
// resets naturally if the bot restarts (same as a real "away" status would).
const afkUsers = new Map(); // userId -> { reason, since }

function setAfk(userId, reason) {
  afkUsers.set(userId, { reason: reason || 'AFK', since: Date.now() });
}

function clearAfk(userId) {
  return afkUsers.delete(userId);
}

function getAfk(userId) {
  return afkUsers.get(userId) || null;
}

module.exports = { setAfk, clearAfk, getAfk };
