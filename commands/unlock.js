const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { logAction } = require('../utils/modLog');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Allow @everyone to send messages in this channel again')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false),

  async execute(interaction) {
    await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
      SendMessages: null, // reset to inherited/default rather than forcing true
    });

    await logAction(interaction.guild, {
      action: '🔓 Channel Unlocked',
      target: interaction.user,
      moderator: interaction.user,
      reason: `#${interaction.channel.name}`,
    });

    await interaction.reply({ content: '🔓 This channel has been unlocked.' });
  },
};
