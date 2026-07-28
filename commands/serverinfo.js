const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('serverinfo').setDescription('Shows info about this server'),

  async execute(interaction) {
    const guild = interaction.guild;
    const owner = await guild.fetchOwner().catch(() => null);

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(guild.name)
      .setThumbnail(guild.iconURL({ size: 256 }))
      .addFields(
        { name: 'Owner', value: owner ? `${owner.user.tag}` : 'Unknown', inline: true },
        { name: 'Members', value: `${guild.memberCount}`, inline: true },
        { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
        { name: 'Roles', value: `${guild.roles.cache.size}`, inline: true },
        { name: 'Channels', value: `${guild.channels.cache.size}`, inline: true },
        { name: 'Boost level', value: `${guild.premiumTier} (${guild.premiumSubscriptionCount || 0} boosts)`, inline: true }
      );

    await interaction.reply({ embeds: [embed] });
  },
};
