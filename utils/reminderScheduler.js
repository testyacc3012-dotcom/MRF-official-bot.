const { removeReminder, getPendingReminders } = require('./reminderStore');

function scheduleReminder(client, reminder) {
  const delay = reminder.fireAt - Date.now();
  const fire = async () => {
    removeReminder(reminder.id);
    const user = await client.users.fetch(reminder.userId).catch(() => null);
    if (!user) return;
    const text = `⏰ Reminder: ${reminder.message}`;
    // Prefer a DM; if that fails (DMs closed), fall back to the channel it was set in.
    const dmOk = await user.send(text).then(() => true).catch(() => false);
    if (!dmOk && reminder.channelId) {
      const channel = client.channels.cache.get(reminder.channelId);
      if (channel) await channel.send(`${user}, ${text}`).catch(() => {});
    }
  };

  if (delay <= 0) {
    fire();
  } else {
    setTimeout(fire, delay);
  }
}

// Called once at startup so reminders set before a restart still fire.
function rescheduleAllReminders(client) {
  for (const reminder of getPendingReminders()) {
    scheduleReminder(client, reminder);
  }
}

module.exports = { scheduleReminder, rescheduleAllReminders };
