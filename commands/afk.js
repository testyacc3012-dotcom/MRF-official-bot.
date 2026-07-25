const { SlashCommandBuilder } = require('discord.js');
const { setAfk } = require('../utils/afkStore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('afk')
    .setDescription("Mark yourself as AFK — the bot will let people know if they mention you")
    .addStringOption((o) => o.setName('reason').setDescription('Why are you AFK?')),

  async execute(interaction) {
    const reason = interaction.options.getString('reason') || 'AFK';
    setAfk(interaction.user.id, reason);
    await interaction.reply({ content: `💤 You're now AFK: ${reason}` });
  },
};
