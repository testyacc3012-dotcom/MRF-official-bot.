const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { dmPunishment } = require('../utils/dmPunishment');
const { logAction } = require('../utils/modLog');
const { checkHierarchy } = require('../utils/hierarchyCheck');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member from the server')
    .addUserOption((o) => o.setName('user').setDescription('User to kick').setRequired(true))
    .addStringOption((o) => o.setName('reason').setDescription('Reason for the kick').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDMPermission(false),

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');

    const targetMember = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!targetMember) {
      return interaction.reply({ content: 'That user is not in this server.', ephemeral: true });
    }

    const hierarchyError = checkHierarchy(interaction, targetMember);
    if (hierarchyError) {
      return interaction.reply({ content: hierarchyError, ephemeral: true });
    }

    const dmSent = await dmPunishment(target, {
      action: 'Kicked',
      guildName: interaction.guild.name,
      reason,
    });

    try {
      await targetMember.kick(`${reason} | Moderator: ${interaction.user.tag}`);
    } catch (e) {
      return interaction.reply({ content: `Failed to kick: ${e.message}`, ephemeral: true });
    }

    await logAction(interaction.guild, { action: '👢 Kick', target, moderator: interaction.user, reason });

    await interaction.reply({
      content: `**${target.tag}** has been kicked.${dmSent ? '' : ' (Could not DM them — they may have DMs off.)'}`,
    });
  },
};
