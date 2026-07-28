require('dotenv').config();

module.exports = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.DISCORD_CLIENT_ID,
  guildId: process.env.DISCORD_GUILD_ID || null, // set this for instant command registration during testing
  appealInvite: process.env.APPEAL_INVITE || 'https://discord.gg/a5sGCRnKzk',
  // The actual appeal/support server + a channel in it the bot can create invites in.
  // Required for the dynamic single-use appeal link system (/whitelist, appeal:true).
  // If either is missing, punishment DMs fall back to the static appealInvite link
  // above, which can't be single-use or auto-revoked.
  appealGuildId: process.env.APPEAL_GUILD_ID || null,
  appealChannelId: process.env.APPEAL_CHANNEL_ID || null,
  // Optional: name of a channel to post a copy of every mod action to. Leave blank to disable.
  modLogChannelName: process.env.MOD_LOG_CHANNEL_NAME || 'mod-logs',
};
