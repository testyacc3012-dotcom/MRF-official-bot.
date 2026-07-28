const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { setGuildConfig, clearGuildConfigKey } = require('../utils/guildConfigStore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setmodlog')
    .setDescription('Configure where mod actions get logged in this server')
    .addSubcommand((sub) =>
      sub
        .setName('set')
        .setDescription('Set the mod-log channel')
        .addChannelOption((o) =>
          o.setName('channel').setDescription('Channel to post mod actions to').addChannelTypes(ChannelType.GuildText).setRequired(true)
        )
    )
    .addSubcommand((sub) => sub.setName('disable').setDescription('Stop logging mod actions'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'set') {
      const channel = interaction.options.getChannel('channel');
      if (!channel) return interaction.reply({ content: "Couldn't find that channel.", ephemeral: true });
      setGuildConfig(interaction.guild.id, { modLogChannelId: channel.id });
      return interaction.reply({ content: `✅ Mod actions will now be logged in ${channel}.` });
    }

    clearGuildConfigKey(interaction.guild.id, 'modLogChannelId');
    await interaction.reply({ content: 'Mod-log override disabled — falling back to the default channel name lookup.' });
  },
};
