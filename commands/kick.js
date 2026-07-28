const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { dmPunishment } = require('../utils/dmPunishment');
const { logAction } = require('../utils/modLog');
const { checkHierarchy } = require('../utils/hierarchyCheck');
const { resolveAppealOption } = require('../utils/appealOption');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member from the server')
    .addUserOption((o) => o.setName('user').setDescription('User to kick').setRequired(true))
    .addStringOption((o) => o.setName('reason').setDescription('Reason for the kick').setRequired(true))
    .addBooleanOption((o) =>
      o
        .setName('appeal')
        .setDescription('Include an appeal link? Default: true. Only Administrators can set this to false.')
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDMPermission(false),

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');
    const { includeAppeal, overridden } = resolveAppealOption(interaction);

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
      client: interaction.client,
      includeAppeal,
    });

    try {
      await targetMember.kick(`${reason} | Moderator: ${interaction.user.tag}`);
    } catch (e) {
      return interaction.reply({ content: `Failed to kick: ${e.message}`, ephemeral: true });
    }

    await logAction(interaction.guild, { action: '👢 Kick', target, moderator: interaction.user, reason });

    await interaction.reply({
      content:
        `**${target.tag}** has been kicked.${dmSent ? '' : ' (Could not DM them — they may have DMs off.)'}` +
        (overridden ? ' (Only Administrators can disable the appeal link — it was included anyway.)' : ''),
      ephemeral: true,
    });
  },
};
