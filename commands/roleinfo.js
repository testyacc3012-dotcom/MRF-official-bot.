const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roleinfo')
    .setDescription('Shows info about a role')
    .addRoleOption((o) => o.setName('role').setDescription('Role to check').setRequired(true)),

  async execute(interaction) {
    const role = interaction.options.getRole('role');
    if (!role) return interaction.reply({ content: "Couldn't find that role.", ephemeral: true });

    const embed = new EmbedBuilder()
      .setColor(role.color || 0x5865f2)
      .setTitle(role.name)
      .addFields(
        { name: 'ID', value: role.id, inline: true },
        { name: 'Color', value: role.hexColor, inline: true },
        { name: 'Members', value: `${role.members.size}`, inline: true },
        { name: 'Mentionable', value: role.mentionable ? 'Yes' : 'No', inline: true },
        { name: 'Hoisted', value: role.hoist ? 'Yes' : 'No', inline: true },
        { name: 'Position', value: `${role.position}`, inline: true },
        { name: 'Created', value: `<t:${Math.floor(role.createdTimestamp / 1000)}:R>` }
      );

    await interaction.reply({ embeds: [embed] });
  },
};
