const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { checkHierarchy } = require('../utils/hierarchyCheck');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nickname')
    .setDescription("Change a member's nickname")
    .addUserOption((o) => o.setName('user').setDescription('User to rename').setRequired(true))
    .addStringOption((o) =>
      o.setName('nickname').setDescription('New nickname (leave blank to reset)').setMaxLength(32)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames)
    .setDMPermission(false),

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const nickname = interaction.options.getString('nickname') || null;

    const targetMember = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!targetMember) {
      return interaction.reply({ content: 'That user is not in this server.', ephemeral: true });
    }

    const hierarchyError = checkHierarchy(interaction, targetMember);
    if (hierarchyError) {
      return interaction.reply({ content: hierarchyError, ephemeral: true });
    }

    try {
      await targetMember.setNickname(nickname, `Changed by ${interaction.user.tag}`);
    } catch (e) {
      return interaction.reply({ content: `Failed to change nickname: ${e.message}`, ephemeral: true });
    }

    await interaction.reply({
      content: nickname ? `**${target.tag}**'s nickname set to **${nickname}**.` : `**${target.tag}**'s nickname reset.`,
    });
  },
};
