const { PermissionFlagsBits } = require('discord.js');

/**
 * Resolves the shared "appeal" option for a punishment command.
 *
 * - Not provided → true (default)
 * - true → true
 * - false, but the invoking moderator is NOT an Administrator → forced back
 *   to true, with `overridden: true` so the command can mention that in
 *   its reply
 * - false, invoking moderator IS an Administrator → true is skipped, appeal
 *   link is omitted
 */
function resolveAppealOption(interaction) {
  const requested = interaction.options.getBoolean('appeal');
  const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);

  if (requested === false && !isAdmin) {
    return { includeAppeal: true, overridden: true };
  }
  return { includeAppeal: requested === null ? true : requested, overridden: false };
}

module.exports = { resolveAppealOption };
