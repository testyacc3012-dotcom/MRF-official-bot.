const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { logAction } = require('../utils/modLog');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Bulk delete recent messages in this channel')
    .addIntegerOption((o) =>
      o.setName('amount').setDescription('Number of messages to delete (1-100)').setRequired(true).setMinValue(1).setMaxValue(100)
    )
    .addUserOption((o) => o.setName('user').setDescription('Only delete messages from this user'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false),

  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');
    const user = interaction.options.getUser('user');

    await interaction.deferReply({ ephemeral: true });

    const messages = await interaction.channel.messages.fetch({ limit: 100 });
    const filtered = user ? messages.filter((m) => m.author.id === user.id) : messages;
    const toDelete = [...filtered.values()].slice(0, amount);

    if (!toDelete.length) {
      return interaction.editReply({ content: 'No matching messages found to delete.' });
    }

    const deleted = await interaction.channel.bulkDelete(toDelete, true).catch(() => null);
    if (!deleted) {
      return interaction.editReply({
        content: 'Failed to delete messages — Discord only allows bulk-deleting messages under 14 days old.',
      });
    }

    await logAction(interaction.guild, {
      action: '🧹 Purge',
      target: user || interaction.user,
      moderator: interaction.user,
      reason: `Deleted ${deleted.size} message(s) in #${interaction.channel.name}`,
    });

    await interaction.editReply({ content: `Deleted ${deleted.size} message(s).` });
  },
};
