const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { logAction } = require('../utils/modLog');
const { checkHierarchy } = require('../utils/hierarchyCheck');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userlock')
    .setDescription('Block a member from viewing/sending in specific channels')
    .addUserOption((o) => o.setName('user').setDescription('User to lock out').setRequired(true))
    .addChannelOption((o) =>
      o.setName('channel1').setDescription('Channel to lock them out of').addChannelTypes(ChannelType.GuildText).setRequired(true)
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
    .addStringOption((o) => o.setName('reason').setDescription('Reason for the lock'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false),

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const channels = ['channel1', 'channel2', 'channel3', 'channel4', 'channel5']
      .map((key) => interaction.options.getChannel(key))
      .filter(Boolean);

    const targetMember = await interaction.guild.members.fetch(target.id).catch(() => null);
    const hierarchyError = checkHierarchy(interaction, targetMember);
    if (hierarchyError) {
      return interaction.reply({ content: hierarchyError, ephemeral: true });
    }

    const locked = [];
    const failed = [];

    for (const channel of channels) {
      try {
        await channel.permissionOverwrites.edit(target.id, {
          ViewChannel: false,
          SendMessages: false,
        });
        locked.push(`#${channel.name}`);
      } catch (e) {
        failed.push(`#${channel.name} (${e.message})`);
      }
    }

    if (locked.length) {
      await logAction(interaction.guild, {
        action: '🔒 User Locked',
        target,
        moderator: interaction.user,
        reason: `${reason} | Channels: ${locked.join(', ')}`,
      });
    }

    let content = locked.length
      ? `🔒 **${target.tag}** has been locked out of: ${locked.join(', ')}`
      : 'No channels were locked.';
    if (failed.length) content += `\nFailed on: ${failed.join(', ')}`;

    await interaction.reply({ content });
  },
};
