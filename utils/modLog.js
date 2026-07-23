const { EmbedBuilder, ChannelType } = require('discord.js');
const { modLogChannelName } = require('../config');

const channelCache = new Map();

async function getLogChannel(guild) {
  if (!modLogChannelName) return null;
  const cached = channelCache.get(guild.id);
  if (cached && guild.channels.cache.has(cached.id)) return cached;

  const channel = guild.channels.cache.find(
    (c) => c.type === ChannelType.GuildText && c.name === modLogChannelName
  );
  if (channel) channelCache.set(guild.id, channel);
  return channel || null;
}

async function logAction(guild, { action, target, moderator, reason, duration }) {
  const channel = await getLogChannel(guild);
  if (!channel) return; // no mod-log channel set up — skip silently

  const embed = new EmbedBuilder()
    .setColor(0x2f3136)
    .setTitle(`${action}`)
    .addFields(
      { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
      { name: 'Moderator', value: `${moderator.tag}`, inline: true },
      { name: 'Reason', value: reason || 'No reason provided' }
    )
    .setTimestamp();

  if (duration) embed.addFields({ name: 'Duration', value: duration, inline: true });

  await channel.send({ embeds: [embed] }).catch(() => {});
}

module.exports = { logAction };
