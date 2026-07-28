const { EmbedBuilder } = require('discord.js');
const { appealInvite: fallbackAppealInvite } = require('../config');
const { issueAppealInvite } = require('./appealInvites');

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
 * Always includes the reason. Includes a one-time appeal link unless
 * explicitly told not to (includeAppeal: false) — see /ban, /kick, /warn,
 * /timeout, /softban's "appeal" option, which only Administrators can set
 * to false.
 *
 * Every appeal link is single-use: issuing a new one automatically revokes
 * whatever link that user had before, so old links stop working the moment
 * a new punishment generates a fresh one.
 *
 * Fails silently (returns false) if the user has DMs closed — this should
 * never block the actual moderation action from happening.
 *
 * @param {User} user - discord.js User to DM
 * @param {object} opts
 * @param {string} opts.action - e.g. 'Banned', 'Kicked', 'Timed Out', 'Warned'
 * @param {string} opts.guildName
 * @param {string} opts.reason
 * @param {string} [opts.duration] - e.g. '1 day' for timeouts
 * @param {Client} [opts.client] - needed to create/revoke the dynamic invite
 * @param {boolean} [opts.includeAppeal=true]
 * @returns {Promise<boolean>} whether the DM was sent successfully
 */
async function dmPunishment(user, { action, guildName, reason, duration, client, includeAppeal = true }) {
  const embed = new EmbedBuilder()
    .setColor(ACTION_COLORS[action] || 0x99aab5)
    .setTitle(`You were ${action.toLowerCase()} in ${guildName}`)
    .addFields({ name: 'Reason', value: reason || 'No reason provided' })
    .setTimestamp();

  if (duration) embed.addFields({ name: 'Duration', value: duration });

  if (includeAppeal) {
    let link = null;
    if (client) link = await issueAppealInvite(client, user.id);
    // Falls back to the static link if the dynamic system isn't configured —
    // that one can't be single-use/auto-revoked, but it's better than nothing.
    link = link || fallbackAppealInvite;

    embed.addFields({
      name: 'Think this was a mistake?',
      value: `Join here to appeal: ${link}`,
    });
  }

  try {
    await user.send({ embeds: [embed] });
    return true;
  } catch {
    return false; // user has DMs off or blocked the bot — not a failure of the command itself
  }
}

module.exports = { dmPunishment };
