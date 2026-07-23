const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { logAction } = require('../utils/modLog');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Prevent @everyone from sending messages in this channel')
    .addStringOption((o) => o.setName('reason').setDescription('Reason for locking'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false),

  async execute(interaction) {
    const reason = interaction.options.getString('reason') || 'No reason provided';

    await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
      SendMessages: false,
    });

    await logAction(interaction.guild, {
      action: '🔒 Channel Locked',
      target: interaction.user,
      moderator: interaction.user,
      reason: `#${interaction.channel.name}: ${reason}`,
    });

    await interaction.reply({ content: `🔒 This channel has been locked. Reason: ${reason}` });
  },
};
