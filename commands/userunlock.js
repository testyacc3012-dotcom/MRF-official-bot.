const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { logAction } = require('../utils/modLog');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userunlock')
    .setDescription("Restore a member's access to channels locked with /userlock")
    .addUserOption((o) => o.setName('user').setDescription('User to unlock').setRequired(true))
    .addChannelOption((o) =>
      o.setName('channel1').setDescription('Channel to restore access to').addChannelTypes(ChannelType.GuildText)
    )
    .addChannelOption((o) =>
      o.setName('channel2').setDescription('Additional channel').addChannelTypes(ChannelType.GuildText)
    )
    .addChannelOption((o) =>
      o.setName('channel3').setDescription('Additional channel').addChannelTypes(ChannelType.GuildText)
    )
    .addChannelOption((o) =>
      o.setName('channel4').setDescription('Additional channel').addChannelTypes(ChannelType.GuildText)
    )
    .addChannelOption((o) =>
      o.setName('channel5').setDescription('Additional channel').addChannelTypes(ChannelType.GuildText)
    )
    .addBooleanOption((o) =>
      o.setName('all').setDescription('Unlock every channel that currently has a lock on this user')
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false),

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const unlockAll = interaction.options.getBoolean('all');

    let channels = ['channel1', 'channel2', 'channel3', 'channel4', 'channel5']
      .map((key) => interaction.options.getChannel(key))
      .filter(Boolean);

    if (unlockAll) {
      channels = interaction.guild.channels.cache
        .filter((c) => c.isTextBased?.() && c.permissionOverwrites.cache.has(target.id))
        .map((c) => c);
    }

    if (!channels.length) {
      return interaction.reply({
        content: 'Pick at least one channel, or use the "all" option.',
        ephemeral: true,
      });
    }

    const unlocked = [];
    const failed = [];

    for (const channel of channels) {
      try {
        await channel.permissionOverwrites.delete(target.id);
        unlocked.push(`#${channel.name}`);
      } catch (e) {
        failed.push(`#${channel.name} (${e.message})`);
      }
    }

    if (unlocked.length) {
      await logAction(interaction.guild, {
        action: '🔓 User Unlocked',
        target,
        moderator: interaction.user,
        reason: `Channels: ${unlocked.join(', ')}`,
      });
    }

    let content = unlocked.length
      ? `🔓 Restored **${target.tag}**'s access to: ${unlocked.join(', ')}`
      : 'Nothing to unlock.';
    if (failed.length) content += `\nFailed on: ${failed.join(', ')}`;

    await interaction.reply({ content });
  },
};
