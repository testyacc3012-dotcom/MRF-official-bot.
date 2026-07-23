const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { dmPunishment } = require('../utils/dmPunishment');
const { logAction } = require('../utils/modLog');
const { checkHierarchy } = require('../utils/hierarchyCheck');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('softban')
    .setDescription('Kick a member and delete their recent messages (does not leave a lasting ban)')
    .addUserOption((o) => o.setName('user').setDescription('User to softban').setRequired(true))
    .addStringOption((o) => o.setName('reason').setDescription('Reason for the softban').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false),

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');

    const targetMember = await interaction.guild.members.fetch(target.id).catch(() => null);
    const hierarchyError = checkHierarchy(interaction, targetMember);
    if (hierarchyError) {
      return interaction.reply({ content: hierarchyError, ephemeral: true });
    }

    const dmSent = await dmPunishment(target, {
      action: 'Kicked',
      guildName: interaction.guild.name,
      reason: `${reason} (softban — your recent messages were also removed)`,
    });

    try {
      await interaction.guild.members.ban(target.id, {
        reason: `Softban: ${reason} | Moderator: ${interaction.user.tag}`,
        deleteMessageSeconds: 86400 * 3, // wipe last 3 days of their messages
      });
      await interaction.guild.members.unban(target.id, 'Softban cleanup — immediate unban');
    } catch (e) {
      return interaction.reply({ content: `Failed to softban: ${e.message}`, ephemeral: true });
    }

    await logAction(interaction.guild, {
      action: '🧹 Softban',
      target,
      moderator: interaction.user,
      reason,
    });

    await interaction.reply({
      content: `**${target.tag}** has been softbanned (kicked, recent messages cleared).${dmSent ? '' : ' (Could not DM them — they may have DMs off.)'}`,
    });
  },
};
