const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getPrefix, setPrefix, DEFAULT_PREFIX } = require('../utils/prefixStore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('prefix')
    .setDescription('View or change this server\'s command prefix')
    .addSubcommand((sub) => sub.setName('show').setDescription('Show the current prefix'))
    .addSubcommand((sub) =>
      sub
        .setName('set')
        .setDescription('Set a new prefix for this server')
        .addStringOption((o) => o.setName('new_prefix').setDescription('New prefix, e.g. !').setRequired(true))
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    if (sub === 'show') {
      const current = getPrefix(guildId);
      return interaction.reply({ content: `Current prefix here: \`${current}\` (default is \`${DEFAULT_PREFIX}\`)` });
    }

    const newPrefix = interaction.options.getString('new_prefix');
    if (!newPrefix || newPrefix.length > 5 || /\s/.test(newPrefix)) {
      return interaction.reply({ content: 'Prefix must be 1-5 characters with no spaces.', ephemeral: true });
    }

    setPrefix(guildId, newPrefix);
    await interaction.reply({ content: `✅ Prefix for this server is now \`${newPrefix}\`. Slash commands still work as normal.` });
  },
};
