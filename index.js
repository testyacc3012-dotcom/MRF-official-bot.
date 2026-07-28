const fs = require('fs');
const path = require('path');
const { Client, Collection, Events, GatewayIntentBits, Partials, REST, Routes, EmbedBuilder } = require('discord.js');
const { token, clientId, guildId } = require('./config');
const { getPrefix } = require('./utils/prefixStore');
const { getGuildConfig } = require('./utils/guildConfigStore');
const { getAfk, clearAfk } = require('./utils/afkStore');
const { PrefixContext } = require('./utils/commandContext');
const { rescheduleAllReminders } = require('./utils/reminderScheduler');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

client.commands = new Collection();
client.aliases = new Collection(); // alias name -> canonical command name
const slashCommands = [];

const commandsPath = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(commandsPath).filter((f) => f.endsWith('.js'))) {
  const cmd = require(path.join(commandsPath, file));
  client.commands.set(cmd.data.name, cmd);
  slashCommands.push(cmd.data.toJSON());
  if (Array.isArray(cmd.aliases)) {
    for (const alias of cmd.aliases) client.aliases.set(alias.toLowerCase(), cmd.data.name);
  }
}

const rest = new REST({ version: '10' }).setToken(token);
(async () => {
  try {
    const route = guildId ? Routes.applicationGuildCommands(clientId, guildId) : Routes.applicationCommands(clientId);
    await rest.put(route, { body: slashCommands });
    console.log(`Registered ${slashCommands.length} slash commands.`);
  } catch (e) {
    console.error('Failed to register commands:', e);
  }
})();

client.once(Events.ClientReady, (c) => {
  console.log(`Mod bot online as ${c.user.tag}`);
  rescheduleAllReminders(c);
});

// ---- Slash commands ----
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const cmd = client.commands.get(interaction.commandName);
  if (!cmd) return;

  try {
    await cmd.execute(interaction);
  } catch (e) {
    console.error(`Error running /${interaction.commandName}:`, e);
    const payload = { content: 'Something went wrong running that command.', ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.editReply(payload).catch(() => {});
    } else {
      await interaction.reply(payload).catch(() => {});
    }
  }
});

// ---- Prefix commands + AFK ----
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot || !message.guild) return;

  // AFK: clear the author's own AFK status the moment they type again.
  const ownAfk = getAfk(message.author.id);
  if (ownAfk) {
    clearAfk(message.author.id);
    message.reply({ content: `Welcome back, ${message.author}! I removed your AFK status.` }).catch(() => {});
  }

  // AFK: let the sender know if they pinged someone who's AFK.
  if (message.mentions.users.size) {
    for (const [, mentioned] of message.mentions.users) {
      const afk = getAfk(mentioned.id);
      if (afk) {
        message.reply({ content: `💤 ${mentioned.username} is AFK: ${afk.reason}` }).catch(() => {});
      }
    }
  }

  const prefix = getPrefix(message.guild.id);
  if (!message.content.startsWith(prefix)) return;

  const withoutPrefix = message.content.slice(prefix.length).trim();
  if (!withoutPrefix) return;

  const firstSpace = withoutPrefix.indexOf(' ');
  const rawName = (firstSpace === -1 ? withoutPrefix : withoutPrefix.slice(0, firstSpace)).toLowerCase();
  const rawArgs = firstSpace === -1 ? '' : withoutPrefix.slice(firstSpace + 1);

  const commandName = client.aliases.get(rawName) || rawName;
  const cmd = client.commands.get(commandName);
  if (!cmd) return;

  const ctx = new PrefixContext(message, cmd, rawArgs);

  try {
    await cmd.execute(ctx);
  } catch (e) {
    console.error(`Error running ${prefix}${rawName}:`, e);
    const payload = { content: 'Something went wrong running that command.' };
    if (ctx.replied || ctx.deferred) {
      await ctx.editReply(payload).catch(() => {});
    } else {
      await ctx.reply(payload).catch(() => {});
    }
  }
});

// ---- Autorole + welcome message ----
client.on(Events.GuildMemberAdd, async (member) => {
  const config = getGuildConfig(member.guild.id);

  if (config.autoroleId) {
    const role = member.guild.roles.cache.get(config.autoroleId);
    if (role) await member.roles.add(role).catch(() => {});
  }

  if (config.welcomeChannelId && config.welcomeMessage) {
    const channel = member.guild.channels.cache.get(config.welcomeChannelId);
    if (channel) {
      const text = config.welcomeMessage
        .replace(/\{user\}/g, `${member}`)
        .replace(/\{server\}/g, member.guild.name);
      const embed = new EmbedBuilder().setColor(0x57f287).setDescription(text);
      channel.send({ embeds: [embed] }).catch(() => {});
    }
  }
});

client.login(token);
