const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('banner')
    .setDescription("Shows a user's profile banner")
    .addUserOption((o) => o.setName('user').setDescription('User to check (defaults to you)')),

  async execute(interaction) {
    const target = interaction.options.getUser('user') || interaction.user;
    // Banner isn't cached on the base user object — needs a fresh fetch.
    const fullUser = await interaction.client.users.fetch(target.id, { force: true }).catch(() => target);
    const bannerUrl = fullUser.bannerURL?.({ size: 1024 });

    if (!bannerUrl) {
      return interaction.reply({ content: `${target.tag} doesn't have a banner set.`, ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`${target.tag}'s banner`)
      .setImage(bannerUrl);
    await interaction.reply({ embeds: [embed] });
  },
};
