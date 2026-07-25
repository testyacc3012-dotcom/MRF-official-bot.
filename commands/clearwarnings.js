const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { clearWarnings } = require('../utils/warningsStore');
const { logAction } = require('../utils/modLog');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearwarnings')
    .setDescription("Clear a member's warning history")
    .addUserOption((o) => o.setName('user').setDescription('User to clear warnings for').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false),

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const count = clearWarnings(interaction.guild.id, target.id);

    if (!count) {
      return interaction.reply({ content: `**${target.tag}** had no warnings to clear.`, ephemeral: true });
    }

    await logAction(interaction.guild, {
      action: '🧽 Warnings Cleared',
      target,
      moderator: interaction.user,
      reason: `Cleared ${count} warning(s)`,
    });

    await interaction.reply({ content: `Cleared ${count} warning(s) for **${target.tag}**.` });
  },
};
