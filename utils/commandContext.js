// Discord's ApplicationCommandOptionType values (avoids importing the enum
// just for these numbers, since we only need to read them from toJSON()).
const OPTION_TYPE = {
  SUB_COMMAND: 1,
  SUB_COMMAND_GROUP: 2,
  STRING: 3,
  INTEGER: 4,
  BOOLEAN: 5,
  USER: 6,
  CHANNEL: 7,
  ROLE: 8,
  MENTIONABLE: 9,
  NUMBER: 10,
  ATTACHMENT: 11,
};

function createTokenReader(raw) {
  const regex = /"([^"]*)"|(\S+)/g;
  return {
    next() {
      const m = regex.exec(raw);
      if (!m) return null;
      return m[1] !== undefined ? m[1] : m[2];
    },
    // Everything left in the raw string after the last token that was read —
    // used for the final free-text option (reasons, message bodies, etc.)
    // so it keeps its original spacing instead of being re-joined.
    remainder() {
      const rest = raw.slice(regex.lastIndex).trim();
      return rest || null;
    },
  };
}

function resolveUserToken(token, message) {
  if (!token) return null;
  const idMatch = token.match(/^<@!?(\d+)>$/) || token.match(/^(\d{15,25})$/);
  if (idMatch) {
    const id = idMatch[1];
    const member = message.guild?.members.cache.get(id);
    if (member) return member.user;
    return message.client.users.cache.get(id) || null;
  }
  const lower = token.toLowerCase();
  const member = message.guild?.members.cache.find(
    (m) => m.user.username.toLowerCase() === lower || m.displayName.toLowerCase() === lower
  );
  return member ? member.user : null;
}

function resolveChannelToken(token, message) {
  if (!token) return null;
  const idMatch = token.match(/^<#(\d+)>$/) || token.match(/^(\d{15,25})$/);
  if (idMatch) return message.guild?.channels.cache.get(idMatch[1]) || null;
  const lower = token.replace(/^#/, '').toLowerCase();
  return message.guild?.channels.cache.find((c) => c.name?.toLowerCase() === lower) || null;
}

function resolveRoleToken(token, message) {
  if (!token) return null;
  const idMatch = token.match(/^<@&(\d+)>$/) || token.match(/^(\d{15,25})$/);
  if (idMatch) return message.guild?.roles.cache.get(idMatch[1]) || null;
  const lower = token.toLowerCase();
  return message.guild?.roles.cache.find((r) => r.name.toLowerCase() === lower) || null;
}

// Walks a command's slash-option schema (from data.toJSON()) and maps the
// prefix command's raw text onto those same option names, in order —
// so a command written against interaction.options.getX() works unmodified.
function parseOptionsFromText(jsonData, rawArgs, message) {
  let optionList = jsonData.options || [];
  let subcommand = null;
  const reader = createTokenReader(rawArgs);

  if (optionList.length && optionList[0].type === OPTION_TYPE.SUB_COMMAND) {
    const subToken = reader.next();
    const subDef = optionList.find((o) => o.name === subToken && o.type === OPTION_TYPE.SUB_COMMAND);
    subcommand = subDef ? subToken : null;
    optionList = subDef ? subDef.options || [] : [];
  }

  const values = {};
  const resolvedUsers = {};
  const resolvedChannels = {};
  const resolvedRoles = {};

  for (let i = 0; i < optionList.length; i++) {
    const opt = optionList[i];
    const isLastString = opt.type === OPTION_TYPE.STRING && i === optionList.length - 1;

    if (isLastString) {
      values[opt.name] = reader.remainder();
      continue;
    }

    const token = reader.next();
    if (token === null) continue;

    switch (opt.type) {
      case OPTION_TYPE.STRING:
      case OPTION_TYPE.INTEGER:
      case OPTION_TYPE.NUMBER:
      case OPTION_TYPE.BOOLEAN:
        values[opt.name] = token;
        break;
      case OPTION_TYPE.USER:
        resolvedUsers[opt.name] = resolveUserToken(token, message);
        break;
      case OPTION_TYPE.CHANNEL:
        resolvedChannels[opt.name] = resolveChannelToken(token, message);
        break;
      case OPTION_TYPE.ROLE:
        resolvedRoles[opt.name] = resolveRoleToken(token, message);
        break;
      default:
        break; // attachments etc. aren't supported via prefix
    }
  }

  return { subcommand, values, resolvedUsers, resolvedChannels, resolvedRoles };
}

function normalizeReplyPayload(payload) {
  if (typeof payload === 'string') return { content: payload };
  const { ephemeral, ...rest } = payload || {};
  return rest;
}

class PrefixContext {
  constructor(message, command, rawArgs) {
    this.message = message;
    this.guild = message.guild;
    this.channel = message.channel;
    this.user = message.author;
    this.member = message.member;
    this.client = message.client;
    this.commandName = command.data.name;
    this.createdTimestamp = message.createdTimestamp;
    this.replied = false;
    this.deferred = false;
    this._sentMessage = null;

    const jsonData = command.data.toJSON();
    const parsed = parseOptionsFromText(jsonData, rawArgs, message);

    this.options = {
      getSubcommand: () => parsed.subcommand,
      getString: (name) => (name in parsed.values ? parsed.values[name] : null),
      getInteger: (name) => {
        const v = parsed.values[name];
        const n = parseInt(v, 10);
        return v == null || Number.isNaN(n) ? null : n;
      },
      getNumber: (name) => {
        const v = parsed.values[name];
        const n = parseFloat(v);
        return v == null || Number.isNaN(n) ? null : n;
      },
      getBoolean: (name) => {
        const v = parsed.values[name];
        if (v == null) return null;
        return /^(true|yes|y|1|on)$/i.test(v);
      },
      getUser: (name) => parsed.resolvedUsers[name] ?? null,
      getChannel: (name) => parsed.resolvedChannels[name] ?? null,
      getRole: (name) => parsed.resolvedRoles[name] ?? null,
    };
  }

  async reply(payload) {
    const content = normalizeReplyPayload(payload);
    try {
      this._sentMessage = await this.message.reply(content);
    } catch {
      this._sentMessage = await this.channel.send(content);
    }
    this.replied = true;
    return this._sentMessage;
  }

  async deferReply() {
    this._sentMessage = await this.channel.send('⏳ Working on it...');
    this.deferred = true;
    return this._sentMessage;
  }

  async editReply(payload) {
    const content = normalizeReplyPayload(payload);
    if (this._sentMessage) {
      try {
        return await this._sentMessage.edit(content);
      } catch {
        return this.channel.send(content);
      }
    }
    return this.reply(payload);
  }

  async followUp(payload) {
    return this.channel.send(normalizeReplyPayload(payload));
  }
}

module.exports = { PrefixContext };
