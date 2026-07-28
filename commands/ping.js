const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('ping').setDescription("Check the bot's latency"),

  async execute(interaction) {
    const start = Date.now();
    await interaction.reply({ content: 'Pinging...' });
    const latency = Date.now() - (interaction.createdTimestamp || start);
    const wsLatency = Math.round(interaction.client.ws.ping);
    await interaction
      .editReply(`🏓 Pong! Latency: ${latency}ms | WebSocket: ${wsLatency}ms`)
      .catch(() => {});
  },
};
