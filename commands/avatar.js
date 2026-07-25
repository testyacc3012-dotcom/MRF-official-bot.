const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription("Shows a user's avatar")
    .addUserOption((o) => o.setName('user').setDescription('User to check (defaults to you)')),

  async execute(interaction) {
    const target = interaction.options.getUser('user') || interaction.user;
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`${target.tag}'s avatar`)
      .setImage(target.displayAvatarURL({ size: 1024 }));
    await interaction.reply({ embeds: [embed] });
  },
};
