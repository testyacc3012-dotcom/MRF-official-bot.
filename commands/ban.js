const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { dmPunishment } = require('../utils/dmPunishment');
const { logAction } = require('../utils/modLog');
const { checkHierarchy } = require('../utils/hierarchyCheck');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member from the server')
    .addUserOption((o) => o.setName('user').setDescription('User to ban').setRequired(true))
    .addStringOption((o) => o.setName('reason').setDescription('Reason for the ban').setRequired(true))
    .addIntegerOption((o) =>
      o.setName('delete_days').setDescription('Days of their messages to delete (0-7)').setMinValue(0).setMaxValue(7)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false),

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');
    const deleteDays = interaction.options.getInteger('delete_days') ?? 0;

    const targetMember = await interaction.guild.members.fetch(target.id).catch(() => null);
    const hierarchyError = checkHierarchy(interaction, targetMember);
    if (hierarchyError) {
      return interaction.reply({ content: hierarchyError, ephemeral: true });
    }

    // DM before banning — once banned, we lose the shared-server context needed to reliably reach them
    const dmSent = await dmPunishment(target, {
      action: 'Banned',
      guildName: interaction.guild.name,
      reason,
    });

    try {
      await interaction.guild.members.ban(target.id, {
        reason: `${reason} | Moderator: ${interaction.user.tag}`,
        deleteMessageSeconds: deleteDays * 86400,
      });
    } catch (e) {
      return interaction.reply({ content: `Failed to ban: ${e.message}`, ephemeral: true });
    }

    await logAction(interaction.guild, { action: '🔨 Ban', target, moderator: interaction.user, reason });

    await interaction.reply({
      content: `**${target.tag}** has been banned.${dmSent ? '' : ' (Could not DM them — they may have DMs off.)'}`,
    });
  },
};
