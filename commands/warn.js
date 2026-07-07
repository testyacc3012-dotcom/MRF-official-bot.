const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { dmPunishment } = require('../utils/dmPunishment');
const { logAction } = require('../utils/modLog');
const { addWarning } = require('../utils/warningsStore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Formally warn a member')
    .addUserOption((o) => o.setName('user').setDescription('User to warn').setRequired(true))
    .addStringOption((o) => o.setName('reason').setDescription('Reason for the warning').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false),

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');

    const totalWarnings = addWarning(interaction.guild.id, target.id, {
      reason,
      moderatorTag: interaction.user.tag,
      timestamp: Date.now(),
    });

    const dmSent = await dmPunishment(target, {
      action: 'Warned',
      guildName: interaction.guild.name,
      reason,
    });

    await logAction(interaction.guild, { action: '⚠️ Warn', target, moderator: interaction.user, reason });

    await interaction.reply({
      content: `**${target.tag}** has been warned. They now have **${totalWarnings}** warning(s).${dmSent ? '' : ' (Could not DM them — they may have DMs off.)'}`,
    });
  },
};
