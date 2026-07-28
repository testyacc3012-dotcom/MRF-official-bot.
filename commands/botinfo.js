const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

function formatUptime(ms) {
  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / 60000) % 60;
  const h = Math.floor(ms / 3600000) % 24;
  const d = Math.floor(ms / 86400000);
  return `${d}d ${h}h ${m}m ${s}s`;
}

module.exports = {
  data: new SlashCommandBuilder().setName('botinfo').setDescription('Shows info about the bot'),

  async execute(interaction) {
    const client = interaction.client;
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(client.user.tag)
      .setThumbnail(client.user.displayAvatarURL())
      .addFields(
        { name: 'Servers', value: `${client.guilds.cache.size}`, inline: true },
        { name: 'Uptime', value: formatUptime(client.uptime), inline: true },
        { name: 'WebSocket ping', value: `${Math.round(client.ws.ping)}ms`, inline: true },
        { name: 'Commands loaded', value: `${client.commands?.size ?? 'Unknown'}`, inline: true }
      );

    await interaction.reply({ embeds: [embed] });
  },
};
