const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'reminders.json');

function readAll() {
  if (!fs.existsSync(FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeAll(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function addReminder({ userId, channelId, guildId, message, fireAt }) {
  const data = readAll();
  const reminder = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, userId, channelId, guildId, message, fireAt };
  data.push(reminder);
  writeAll(data);
  return reminder;
}

function removeReminder(id) {
  const data = readAll().filter((r) => r.id !== id);
  writeAll(data);
}

function getPendingReminders() {
  return readAll();
}

// Parses simple durations like "10m", "2h", "1d", "30s", "1h30m".
// Returns milliseconds, or null if nothing recognizable was found.
function parseDuration(text) {
  const regex = /(\d+)\s*(d|h|m|s)/gi;
  let match;
  let totalMs = 0;
  let found = false;
  while ((match = regex.exec(text)) !== null) {
    found = true;
    const value = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();
    const unitMs = { s: 1000, m: 60000, h: 3600000, d: 86400000 }[unit];
    totalMs += value * unitMs;
  }
  return found ? totalMs : null;
}

module.exports = { addReminder, removeReminder, getPendingReminders, parseDuration };
