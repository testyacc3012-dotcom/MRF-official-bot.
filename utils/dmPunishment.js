const { EmbedBuilder } = require('discord.js');
const { appealInvite } = require('../config');

const ACTION_COLORS = {
  Warned: 0xfee75c,
  'Timed Out': 0xf57c00,
  'Timeout Removed': 0x57f287,
  Kicked: 0xed4245,
  Banned: 0x992d22,
  Unbanned: 0x57f287,
};

/**
 * DMs a user about a moderation action taken against them.
 * Always includes the reason and an appeal/invite link.
 * Fails silently (returns false) if the user has DMs closed — this should
 * never block the actual moderation action from happening.
 *
 * @param {User} user - discord.js User to DM
 * @param {object} opts
 * @param {string} opts.action - e.g. 'Banned', 'Kicked', 'Timed Out', 'Warned'
 * @param {string} opts.guildName
 * @param {string} opts.reason
 * @param {string} [opts.duration] - e.g. '1 day' for timeouts
 * @returns {Promise<boolean>} whether the DM was sent successfully
 */
async function dmPunishment(user, { action, guildName, reason, duration }) {
  const embed = new EmbedBuilder()
    .setColor(ACTION_COLORS[action] || 0x99aab5)
    .setTitle(`You were ${action.toLowerCase()} in ${guildName}`)
    .addFields({ name: 'Reason', value: reason || 'No reason provided' })
    .setTimestamp();

  if (duration) embed.addFields({ name: 'Duration', value: duration });

  embed.addFields({
    name: 'Think this was a mistake?',
    value: `Join here to appeal: ${appealInvite}`,
  });

  try {
    await user.send({ embeds: [embed] });
    return true;
  } catch {
    return false; // user has DMs off or blocked the bot — not a failure of the command itself
  }
}

module.exports = { dmPunishment };
