const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'prefixes.json');
const DEFAULT_PREFIX = '?';

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

function getPrefix(guildId) {
  const data = readAll();
  return data[guildId] || DEFAULT_PREFIX;
}

function setPrefix(guildId, prefix) {
  const data = readAll();
  data[guildId] = prefix;
  writeAll(data);
}

function resetPrefix(guildId) {
  const data = readAll();
  delete data[guildId];
  writeAll(data);
}

module.exports = { getPrefix, setPrefix, resetPrefix, DEFAULT_PREFIX };
