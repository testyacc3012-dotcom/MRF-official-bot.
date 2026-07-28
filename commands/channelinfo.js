const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('channelinfo')
    .setDescription('Shows info about a channel')
    .addChannelOption((o) => o.setName('channel').setDescription('Channel to check (defaults to this one)')),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel') || interaction.channel;

    const typeNames = {
      [ChannelType.GuildText]: 'Text',
      [ChannelType.GuildVoice]: 'Voice',
      [ChannelType.GuildAnnouncement]: 'Announcement',
      [ChannelType.GuildForum]: 'Forum',
      [ChannelType.GuildStageVoice]: 'Stage',
      [ChannelType.GuildCategory]: 'Category',
    };

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`#${channel.name}`)
      .addFields(
        { name: 'ID', value: channel.id, inline: true },
        { name: 'Type', value: typeNames[channel.type] || 'Unknown', inline: true },
        { name: 'Created', value: `<t:${Math.floor(channel.createdTimestamp / 1000)}:R>`, inline: true }
      );

    if ('topic' in channel && channel.topic) embed.addFields({ name: 'Topic', value: channel.topic });
    if ('rateLimitPerUser' in channel && channel.rateLimitPerUser) {
      embed.addFields({ name: 'Slowmode', value: `${channel.rateLimitPerUser}s`, inline: true });
    }

    await interaction.reply({ embeds: [embed] });
  },
};
