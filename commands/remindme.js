const { SlashCommandBuilder } = require('discord.js');
const { addReminder, parseDuration } = require('../utils/reminderStore');
const { scheduleReminder } = require('../utils/reminderScheduler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remindme')
    .setDescription('Sets a reminder')
    .addStringOption((o) => o.setName('time').setDescription('e.g. 10m, 2h, 1d, 1h30m').setRequired(true))
    .addStringOption((o) => o.setName('message').setDescription('What to remind you about').setRequired(true)),

  async execute(interaction) {
    const timeText = interaction.options.getString('time');
    const message = interaction.options.getString('message');
    const ms = parseDuration(timeText || '');

    if (!ms || ms <= 0) {
      return interaction.reply({ content: "Couldn't understand that time — try something like `10m`, `2h`, or `1d`.", ephemeral: true });
    }
    if (ms > 30 * 24 * 60 * 60 * 1000) {
      return interaction.reply({ content: "That's too far out — max reminder length is 30 days.", ephemeral: true });
    }

    const fireAt = Date.now() + ms;
    const reminder = addReminder({
      userId: interaction.user.id,
      channelId: interaction.channel.id,
      guildId: interaction.guild?.id || null,
      message,
      fireAt,
    });
    scheduleReminder(interaction.client, reminder);

    await interaction.reply({ content: `⏰ Got it — I'll remind you <t:${Math.floor(fireAt / 1000)}:R>.` });
  },
};
