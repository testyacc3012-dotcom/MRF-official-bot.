const { SlashCommandBuilder } = require('discord.js');

const ANSWERS = [
  'It is certain.', 'Without a doubt.', 'Yes, definitely.', 'You may rely on it.',
  'As I see it, yes.', 'Most likely.', 'Outlook good.', 'Signs point to yes.',
  'Reply hazy, try again.', 'Ask again later.', 'Better not tell you now.',
  'Cannot predict now.', "Don't count on it.", 'My reply is no.',
  'My sources say no.', 'Outlook not so good.', 'Very doubtful.',
];

module.exports = {
  // Named "eightball" since slash command names can't reliably start with a
  // digit on every client — the prefix command still answers to "8ball" too.
  data: new SlashCommandBuilder()
    .setName('eightball')
    .setDescription('Ask the magic 8-ball a question')
    .addStringOption((o) => o.setName('question').setDescription('Your question').setRequired(true)),

  aliases: ['8ball'],

  async execute(interaction) {
    const question = interaction.options.getString('question');
    if (!question) return interaction.reply({ content: 'Ask me something!', ephemeral: true });
    const answer = ANSWERS[Math.floor(Math.random() * ANSWERS.length)];
    await interaction.reply({ content: `🎱 **${answer}**` });
  },
};
