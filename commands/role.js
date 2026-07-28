const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { logAction } = require('../utils/modLog');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role')
    .setDescription('Add or remove a role from a member')
    .addSubcommand((sub) =>
      sub
        .setName('add')
        .setDescription('Give a member a role')
        .addUserOption((o) => o.setName('user').setDescription('Member to give the role to').setRequired(true))
        .addRoleOption((o) => o.setName('role').setDescription('Role to give').setRequired(true))
    )
    .addSubcommand((sub) =>
      sub
        .setName('remove')
        .setDescription('Take a role away from a member')
        .addUserOption((o) => o.setName('user').setDescription('Member to remove the role from').setRequired(true))
        .addRoleOption((o) => o.setName('role').setDescription('Role to remove').setRequired(true))
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .setDMPermission(false),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const target = interaction.options.getUser('user');
    const role = interaction.options.getRole('role');

    if (!role) return interaction.reply({ content: "Couldn't find that role.", ephemeral: true });

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) return interaction.reply({ content: `${target} isn't in this server.`, ephemeral: true });

    const botMember = interaction.guild.members.me;
    if (role.position >= botMember.roles.highest.position) {
      return interaction.reply({ content: `I can't manage **${role.name}** — it's above my highest role.`, ephemeral: true });
    }
    if (
      interaction.member.id !== interaction.guild.ownerId &&
      role.position >= interaction.member.roles.highest.position
    ) {
      return interaction.reply({ content: `You can't manage **${role.name}** — it's at or above your highest role.`, ephemeral: true });
    }

    try {
      if (sub === 'add') {
        await member.roles.add(role, `Added by ${interaction.user.tag}`);
        await logAction(interaction.guild, {
          action: '➕ Role Added',
          target,
          moderator: interaction.user,
          reason: role.name,
        });
        await interaction.reply({ content: `Gave **${role.name}** to ${target}.` });
      } else {
        await member.roles.remove(role, `Removed by ${interaction.user.tag}`);
        await logAction(interaction.guild, {
          action: '➖ Role Removed',
          target,
          moderator: interaction.user,
          reason: role.name,
        });
        await interaction.reply({ content: `Removed **${role.name}** from ${target}.` });
      }
    } catch (e) {
      await interaction.reply({ content: `Couldn't update that role: ${e.message}`, ephemeral: true });
    }
  },
};
