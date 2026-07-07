/**
 * Returns an error string if the action shouldn't proceed, or null if it's safe to continue.
 * Prevents mods from acting on people equal/higher than them, and catches the bot's own role limits.
 */
function checkHierarchy(interaction, targetMember) {
  if (!targetMember) return null; // target isn't in the server (e.g. banning by ID) — skip checks

  if (targetMember.id === interaction.user.id) {
    return "You can't do that to yourself.";
  }
  if (targetMember.id === interaction.guild.ownerId) {
    return "You can't take action against the server owner.";
  }

  const executorMember = interaction.member;
  if (
    executorMember.roles.highest.position <= targetMember.roles.highest.position &&
    interaction.guild.ownerId !== executorMember.id
  ) {
    return "You can't act on someone with an equal or higher role than you.";
  }

  const botMember = interaction.guild.members.me;
  if (botMember.roles.highest.position <= targetMember.roles.highest.position) {
    return "My role is too low to do that to this user — move my role higher in Server Settings > Roles.";
  }
  if (!targetMember.moderatable) {
    return "I don't have permission to do that to this user.";
  }

  return null;
}

module.exports = { checkHierarchy };
