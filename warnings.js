const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { getWarnings } = require('../utils/warningsStore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription("View a member's warning history")
    .addUserOption((o) => o.setName('user').setDescription('User to check').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false),

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const warnings = getWarnings(interaction.guild.id, target.id);

    if (!warnings.length) {
      return interaction.reply({ content: `**${target.tag}** has no warnings.`, ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor(0xfee75c)
      .setTitle(`Warnings for ${target.tag}`)
      .setDescription(
        warnings
          .map(
            (w, i) =>
              `**#${i + 1}** — ${w.reason}\n*by ${w.moderatorTag} • <t:${Math.floor(w.timestamp / 1000)}:R>*`
          )
          .join('\n\n')
          .slice(0, 4096)
      );

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
