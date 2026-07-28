const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'guildConfig.json');

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

function getGuildConfig(guildId) {
  const data = readAll();
  return data[guildId] || {};
}

function setGuildConfig(guildId, updates) {
  const data = readAll();
  data[guildId] = { ...(data[guildId] || {}), ...updates };
  writeAll(data);
  return data[guildId];
}

function clearGuildConfigKey(guildId, key) {
  const data = readAll();
  if (data[guildId]) delete data[guildId][key];
  writeAll(data);
}

module.exports = { getGuildConfig, setGuildConfig, clearGuildConfigKey };
