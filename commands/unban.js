const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { dmPunishment } = require('../utils/dmPunishment');
const { logAction } = require('../utils/modLog');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a user by their ID')
    .addStringOption((o) => o.setName('user_id').setDescription('The banned user\'s ID').setRequired(true))
    .addStringOption((o) => o.setName('reason').setDescription('Reason for the unban'))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false),

  async execute(interaction) {
    const userId = interaction.options.getString('user_id');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    const banEntry = await interaction.guild.bans.fetch(userId).catch(() => null);
    if (!banEntry) {
      return interaction.reply({ content: 'That user is not currently banned.', ephemeral: true });
    }

    try {
      await interaction.guild.members.unban(userId, `${reason} | Moderator: ${interaction.user.tag}`);
    } catch (e) {
      return interaction.reply({ content: `Failed to unban: ${e.message}`, ephemeral: true });
    }

    // Best-effort DM — they're no longer bound to this guild's ban list, but the bot can often still reach them
    await dmPunishment(banEntry.user, {
      action: 'Unbanned',
      guildName: interaction.guild.name,
      reason,
    });

    await logAction(interaction.guild, {
      action: '🔓 Unban',
      target: banEntry.user,
      moderator: interaction.user,
      reason,
    });

    await interaction.reply({ content: `**${banEntry.user.tag}** has been unbanned.` });
  },
};
