const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dice')
    .setDescription('Rolls a die')
    .addIntegerOption((o) => o.setName('sides').setDescription('Number of sides (default 6)').setMinValue(2).setMaxValue(1000)),

  async execute(interaction) {
    const sides = interaction.options.getInteger('sides') || 6;
    const roll = Math.floor(Math.random() * sides) + 1;
    await interaction.reply({ content: `🎲 You rolled a **${roll}** (out of ${sides}).` });
  },
};
