const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { issueAppealInvite } = require('../utils/appealInvites');
const { logAction } = require('../utils/modLog');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('whitelist')
    .setDescription("Issue a fresh, valid appeal-server invite to a user")
    .addUserOption((o) => o.setName('user').setDescription('User to restore appeal access for').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  async execute(interaction) {
    const target = interaction.options.getUser('user');

    const url = await issueAppealInvite(interaction.client, target.id);
    if (!url) {
      return interaction.reply({
        content:
          'Could not generate an appeal invite. Make sure APPEAL_GUILD_ID and APPEAL_CHANNEL_ID are set in the bot\'s environment variables, and that the bot is a member of that server with permission to create invites there.',
        ephemeral: true,
      });
    }

    let dmSent = false;
    try {
      await target.send(
        `You've been granted access to the appeal server again: ${url}\nThis link is single-use, so don't share it — it'll stop working the moment it's used or a newer one is issued.`
      );
      dmSent = true;
    } catch {
      dmSent = false;
    }

    await logAction(interaction.guild, {
      action: '✅ Whitelisted',
      target,
      moderator: interaction.user,
      reason: 'New appeal invite issued',
    });

    await interaction.reply({
      content: dmSent
        ? `✅ New appeal invite issued for **${target.tag}** and sent via DM.`
        : `✅ New appeal invite issued for **${target.tag}**, but I couldn't DM them (DMs may be off). Share this link with them manually: ${url}`,
      ephemeral: true,
    });
  },
};
