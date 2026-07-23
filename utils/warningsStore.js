const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'warnings.json');

function readAll() {
  if (!fs.existsSync(FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(FILE, 'utf8'));
  } catch {
    return {};
  }
}

function writeAll(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function addWarning(guildId, userId, { reason, moderatorTag, timestamp }) {
  const data = readAll();
  data[guildId] = data[guildId] || {};
  data[guildId][userId] = data[guildId][userId] || [];
  data[guildId][userId].push({ reason, moderatorTag, timestamp });
  writeAll(data);
  return data[guildId][userId].length; // total warning count after adding
}

function getWarnings(guildId, userId) {
  const data = readAll();
  return data[guildId]?.[userId] || [];
}

function clearWarnings(guildId, userId) {
  const data = readAll();
  const count = data[guildId]?.[userId]?.length || 0;
  if (data[guildId]) delete data[guildId][userId];
  writeAll(data);
  return count;
}

module.exports = { addWarning, getWarnings, clearWarnings };
