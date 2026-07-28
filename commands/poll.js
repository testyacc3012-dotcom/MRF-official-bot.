const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

const NUMBER_EMOJI = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Creates a reaction poll')
    .addStringOption((o) => o.setName('question').setDescription('The poll question (quote it if using the prefix command)').setRequired(true))
    .addStringOption((o) =>
      o.setName('options').setDescription('Comma-separated options, 2-10 (e.g. Pizza, Tacos, Sushi)').setRequired(true)
    )
    .setDMPermission(false),

  async execute(interaction) {
    const question = interaction.options.getString('question');
    const optionsRaw = interaction.options.getString('options');

    if (!question || !optionsRaw) {
      return interaction.reply({ content: 'Usage: `/poll question:"..." options:"A, B, C"`', ephemeral: true });
    }

    const options = optionsRaw.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 10);
    if (options.length < 2) {
      return interaction.reply({ content: 'Give me at least 2 options, separated by commas.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`📊 ${question}`)
      .setDescription(options.map((opt, i) => `${NUMBER_EMOJI[i]} ${opt}`).join('\n'))
      .setFooter({ text: `Poll by ${interaction.user.tag}` });

    await interaction.reply({ embeds: [embed] });

    // Grab the message we just sent so we can react to it — this works
    // the same way whether it came from a real interaction or the prefix adapter.
    let pollMessage = null;
    if (interaction.fetchReply) {
      pollMessage = await interaction.fetchReply().catch(() => null);
    }
    if (!pollMessage && interaction._sentMessage) pollMessage = interaction._sentMessage;

    if (pollMessage) {
      for (let i = 0; i < options.length; i++) {
        await pollMessage.react(NUMBER_EMOJI[i]).catch(() => {});
      }
    }
  },
};
