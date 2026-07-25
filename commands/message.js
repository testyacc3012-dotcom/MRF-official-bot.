const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('message')
    .setDescription('Sends a message to a channel as the bot')
    .addChannelOption((o) =>
      o.setName('channel').setDescription('Channel to send to').addChannelTypes(ChannelType.GuildText).setRequired(true)
    )
    .addStringOption((o) => o.setName('message').setDescription('The message to send').setRequired(true))
    .addBooleanOption((o) => o.setName('embed').setDescription('Send as an embed instead of plain text'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    const text = interaction.options.getString('message');
    const asEmbed = interaction.options.getBoolean('embed') || false;

    if (!channel || !text) {
      return interaction.reply({ content: 'Need both a channel and a message.', ephemeral: true });
    }
    if (!channel.isTextBased?.()) {
      return interaction.reply({ content: "That channel can't receive messages.", ephemeral: true });
    }

    const perms = channel.permissionsFor(interaction.client.user);
    if (!perms?.has(PermissionFlagsBits.SendMessages)) {
      return interaction.reply({ content: `I don't have permission to send messages in ${channel}.`, ephemeral: true });
    }

    // Only let the mentions actually ping if the person running this command
    // is themselves allowed to trigger that kind of mention.
    const memberPerms = interaction.member.permissions;
    const canMentionEveryone = memberPerms.has(PermissionFlagsBits.MentionEveryone) || memberPerms.has(PermissionFlagsBits.Administrator);
    const canMentionRoles = memberPerms.has(PermissionFlagsBits.ManageRoles) || memberPerms.has(PermissionFlagsBits.Administrator);

    const parse = ['users'];
    if (canMentionEveryone) parse.push('everyone');
    if (canMentionRoles) parse.push('roles');

    const payload = { allowedMentions: { parse } };

    if (asEmbed) {
      payload.embeds = [new EmbedBuilder().setColor(0x5865f2).setDescription(text)];
    } else {
      payload.content = text;
    }

    try {
      await channel.send(payload);
    } catch (e) {
      return interaction.reply({ content: `Couldn't send that message: ${e.message}`, ephemeral: true });
    }

    await interaction.reply({ content: `✅ Sent to ${channel}.`, ephemeral: true });
  },
};
