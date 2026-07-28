const { getAppealRecord, setAppealRecord } = require('./appealStore');
const { appealGuildId, appealChannelId } = require('../config');

/**
 * Deletes a user's previously-issued appeal invite, if the bot can still
 * find/manage it. Safe to call even when there's nothing to revoke — it
 * just means their old link stops working (Discord shows "Invite Invalid"),
 * nothing else about their access changes.
 */
async function revokePreviousInvite(client, userId) {
  const record = getAppealRecord(userId);
  if (!record) return;

  try {
    const guild = await client.guilds.fetch(record.guildId);
    const invites = await guild.invites.fetch();
    const invite = invites.get(record.code);
    if (invite) await invite.delete('Superseded by a new appeal invite');
  } catch {
    // Already used, already expired, or the bot lost access — nothing more to do.
  }
}

/**
 * Issues a brand new single-use appeal-server invite for this user,
 * revoking whatever invite they had before in the same step. Returns the
 * invite URL, or null if the appeal server isn't configured or the bot
 * couldn't create an invite right now (missing permissions, etc.).
 */
async function issueAppealInvite(client, userId) {
  if (!appealGuildId || !appealChannelId) return null;

  await revokePreviousInvite(client, userId);

  try {
    const guild = await client.guilds.fetch(appealGuildId);
    const channel = await guild.channels.fetch(appealChannelId);
    const invite = await channel.createInvite({
      maxUses: 1,
      unique: true, // forces a distinct code instead of reusing an existing invite
      maxAge: 0, // doesn't expire on its own — it expires when used or explicitly revoked
      reason: `Appeal invite for user ${userId}`,
    });

    setAppealRecord(userId, {
      code: invite.code,
      guildId: appealGuildId,
      channelId: appealChannelId,
      createdAt: Date.now(),
    });

    return invite.url;
  } catch {
    return null;
  }
}

module.exports = { issueAppealInvite, revokePreviousInvite };
