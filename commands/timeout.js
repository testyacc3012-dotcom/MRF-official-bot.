const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { dmPunishment } = require('../utils/dmPunishment');
const { logAction } = require('../utils/modLog');
const { checkHierarchy } = require('../utils/hierarchyCheck');

const UNIT_MS = { minutes: 60_000, hours: 3_600_000, days: 86_400_000 };
const MAX_TIMEOUT_MS = 28 * UNIT_MS.days; // Discord's own cap

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Temporarily mute a member')
    .addUserOption((o) => o.setName('user').setDescription('User to time out').setRequired(true))
    .addIntegerOption((o) => o.setName('duration').setDescription('Duration amount').setRequired(true).setMinValue(1))
    .addStringOption((o) =>
      o
        .setName('unit')
        .setDescription('Duration unit')
        .setRequired(true)
        .addChoices(
          { name: 'Minutes', value: 'minutes' },
          { name: 'Hours', value: 'hours' },
          { name: 'Days', value: 'days' }
        )
    )
    .addStringOption((o) => o.setName('reason').setDescription('Reason for the timeout').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false),

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('duration');
    const unit = interaction.options.getString('unit');
    const reason = interaction.options.getString('reason');

    const durationMs = Math.min(amount * UNIT_MS[unit], MAX_TIMEOUT_MS);
    const durationLabel = `${amount} ${unit}`;

    const targetMember = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!targetMember) {
      return interaction.reply({ content: 'That user is not in this server.', ephemeral: true });
    }

    const hierarchyError = checkHierarchy(interaction, targetMember);
    if (hierarchyError) {
      return interaction.reply({ content: hierarchyError, ephemeral: true });
    }

    const dmSent = await dmPunishment(target, {
      action: 'Timed Out',
      guildName: interaction.guild.name,
      reason,
      duration: durationLabel,
    });

    try {
      await targetMember.timeout(durationMs, `${reason} | Moderator: ${interaction.user.tag}`);
    } catch (e) {
      return interaction.reply({ content: `Failed to time out: ${e.message}`, ephemeral: true });
    }

    await logAction(interaction.guild, {
      action: '🔇 Timeout',
      target,
      moderator: interaction.user,
      reason,
      duration: durationLabel,
    });

    await interaction.reply({
      content: `**${target.tag}** has been timed out for ${durationLabel}.${dmSent ? '' : ' (Could not DM them — they may have DMs off.)'}`,
    });
  },
};
