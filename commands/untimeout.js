const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { dmPunishment } = require('../utils/dmPunishment');
const { logAction } = require('../utils/modLog');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('untimeout')
    .setDescription("Remove a member's timeout")
    .addUserOption((o) => o.setName('user').setDescription('User to remove timeout from').setRequired(true))
    .addStringOption((o) => o.setName('reason').setDescription('Reason'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false),

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    const targetMember = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!targetMember) {
      return interaction.reply({ content: 'That user is not in this server.', ephemeral: true });
    }
    if (!targetMember.communicationDisabledUntilTimestamp) {
      return interaction.reply({ content: 'That user is not currently timed out.', ephemeral: true });
    }

    try {
      await targetMember.timeout(null, `${reason} | Moderator: ${interaction.user.tag}`);
    } catch (e) {
      return interaction.reply({ content: `Failed to remove timeout: ${e.message}`, ephemeral: true });
    }

    await dmPunishment(target, {
      action: 'Timeout Removed',
      guildName: interaction.guild.name,
      reason,
    });

    await logAction(interaction.guild, {
      action: '🔊 Timeout Removed',
      target,
      moderator: interaction.user,
      reason,
    });

    await interaction.reply({ content: `Timeout removed for **${target.tag}**.` });
  },
};
