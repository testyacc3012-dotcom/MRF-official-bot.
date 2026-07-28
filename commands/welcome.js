const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { setGuildConfig, clearGuildConfigKey } = require('../utils/guildConfigStore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('welcome')
    .setDescription('Configure the welcome message for new members')
    .addSubcommand((sub) =>
      sub
        .setName('set')
        .setDescription('Set the welcome channel and message')
        .addChannelOption((o) =>
          o.setName('channel').setDescription('Channel to post welcomes in').addChannelTypes(ChannelType.GuildText).setRequired(true)
        )
        .addStringOption((o) =>
          o
            .setName('message')
            .setDescription('Use {user} for a mention and {server} for the server name')
            .setRequired(true)
        )
    )
    .addSubcommand((sub) => sub.setName('disable').setDescription('Turn off welcome messages'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'set') {
      const channel = interaction.options.getChannel('channel');
      const message = interaction.options.getString('message');
      if (!channel || !message) {
        return interaction.reply({ content: 'Need both a channel and a message.', ephemeral: true });
      }

      setGuildConfig(interaction.guild.id, { welcomeChannelId: channel.id, welcomeMessage: message });
      return interaction.reply({ content: `✅ Welcome messages will post in ${channel}.` });
    }

    clearGuildConfigKey(interaction.guild.id, 'welcomeChannelId');
    clearGuildConfigKey(interaction.guild.id, 'welcomeMessage');
    await interaction.reply({ content: 'Welcome messages disabled.' });
  },
};
