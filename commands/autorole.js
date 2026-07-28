const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { setGuildConfig, clearGuildConfigKey, getGuildConfig } = require('../utils/guildConfigStore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('autorole')
    .setDescription('Configure a role automatically given to new members')
    .addSubcommand((sub) =>
      sub
        .setName('set')
        .setDescription('Set the auto-role')
        .addRoleOption((o) => o.setName('role').setDescription('Role to give new members').setRequired(true))
    )
    .addSubcommand((sub) => sub.setName('disable').setDescription('Turn off auto-role'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .setDMPermission(false),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'set') {
      const role = interaction.options.getRole('role');
      if (!role) return interaction.reply({ content: "Couldn't find that role.", ephemeral: true });

      const botMember = interaction.guild.members.me;
      if (role.position >= botMember.roles.highest.position) {
        return interaction.reply({ content: `I can't assign **${role.name}** — it's above my highest role.`, ephemeral: true });
      }

      setGuildConfig(interaction.guild.id, { autoroleId: role.id });
      return interaction.reply({ content: `✅ New members will now automatically get **${role.name}**.` });
    }

    clearGuildConfigKey(interaction.guild.id, 'autoroleId');
    await interaction.reply({ content: 'Auto-role disabled.' });
  },
};
