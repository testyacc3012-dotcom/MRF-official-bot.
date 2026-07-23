require('dotenv').config();

module.exports = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.DISCORD_CLIENT_ID,
  guildId: process.env.DISCORD_GUILD_ID || null, // set this for instant command registration during testing
  appealInvite: process.env.APPEAL_INVITE || 'https://discord.gg/8nPqvmJC2r',
  // Optional: name of a channel to post a copy of every mod action to. Leave blank to disable.
  modLogChannelName: process.env.MOD_LOG_CHANNEL_NAME || 'mod-logs',
};
