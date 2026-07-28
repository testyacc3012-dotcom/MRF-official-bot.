const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'appeals.json');

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

// One record per user (not per-guild) — the appeal server is a single shared
// place, separate from whichever guild the punishment happened in.
function getAppealRecord(userId) {
  const data = readAll();
  return data[userId] || null;
}

function setAppealRecord(userId, record) {
  const data = readAll();
  data[userId] = record;
  writeAll(data);
}

function clearAppealRecord(userId) {
  const data = readAll();
  delete data[userId];
  writeAll(data);
}

module.exports = { getAppealRecord, setAppealRecord, clearAppealRecord };
