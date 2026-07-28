# Discord Mod Bot

36 slash commands, every one of them also usable as a prefix command
(default prefix `?`, customizable per server).

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in `DISCORD_TOKEN`,
   `DISCORD_CLIENT_ID`, and optionally `DISCORD_GUILD_ID` (for instant
   command registration while testing a single server).
3. `npm start`

Slash commands register automatically on login. Prefix commands work the
moment the bot is online — no extra setup needed.

## Prefix system

- Default prefix is `?` for every server until changed.
- `/prefix show` or `?prefix show` — see the current prefix.
- `/prefix set new_prefix:!` or `?prefix set !` — change it (Administrator only).
- Stored per-server in `prefixes.json`, created automatically.
- Every command works both ways: `/ban user:@Alex reason:spam` and
  `?ban @Alex spam` do the same thing. Multi-word arguments that aren't the
  last option in a command should be quoted when using the prefix version,
  e.g. `?poll "Best pizza topping?" Pepperoni, Mushroom, Pineapple`.

## Original commands

`ban`, `unban`, `kick`, `timeout`, `untimeout`, `warn`, `warnings`,
`clearwarnings`, `softban`, `lock`, `unlock`, `userlock`, `userunlock`,
`purge`, `slowmode`, `nickname`.

## Appeal link system

`ban`, `kick`, `warn`, `timeout`, and `softban` all take an optional
`appeal` (true/false) option. It defaults to `true` if left blank.
**Only Administrators can set it to `false`** — if a non-admin tries, the
command silently keeps it `true` and says so in the (private) confirmation
message.

When `appeal` is `true`, the punished user gets a **single-use** invite to
the appeal/support server in their DM. Issuing a new one automatically
revokes whatever invite that same user had from an earlier punishment —
old links stop working (Discord shows "Invite Invalid") the moment a new
one is created.

- `/whitelist <user>` (Administrator only) — issues a fresh valid invite
  for a user, e.g. after their previous one was used up or revoked, and
  DMs it to them.
- There's intentionally no `/blacklist` — to cut someone off, simply don't
  run `/whitelist` again; nothing needs to be actively revoked beyond what
  already happens automatically.

**Setup required** — add these to your environment variables:

```
APPEAL_GUILD_ID=<the appeal/support server's ID>
APPEAL_CHANNEL_ID=<a text channel in that server the bot can post invites in>
```

The bot needs to be a member of that server with permission to create
invites in the chosen channel (and to manage/delete invites there, so it
can revoke old ones). If these two variables aren't set, the system falls
back to the static `APPEAL_INVITE` link from before — that fallback link
still gets sent, it just can't be single-use or auto-revoked.

New file: `appeals.json` (created automatically) tracks each user's most
recent invite code so it can be found and revoked later. Safe to delete —
worst case, one old invite doesn't get cleaned up.

## New commands added in this update

**Moderation**
- `role add` / `role remove` — give or take a role from a member

**Utility / Information**
- `ping`, `avatar`, `banner`, `userinfo`, `serverinfo`, `roleinfo`,
  `channelinfo`, `botinfo`

**Server management / Configuration**
- `autorole set` / `autorole disable` — auto-role for new members
- `welcome set` / `welcome disable` — welcome message with `{user}` and
  `{server}` placeholders
- `setmodlog set` / `setmodlog disable` — per-server mod-log channel override
  (falls back to the `mod-logs`-named channel from `config.js` if not set)
- `prefix show` / `prefix set` — this server's custom prefix

**Fun**
- `eightball` (also answers to `8ball` via prefix), `coinflip`, `dice`

**Utility (state-based)**
- `afk` — auto-notifies anyone who @-mentions you while you're away, clears
  itself the next time you send a message
- `remindme` — DMs you after a delay (`10m`, `2h`, `1d`, `1h30m`, etc.),
  falls back to pinging you in the original channel if your DMs are closed.
  Reminders are saved to `reminders.json` and survive a bot restart.

**Custom messaging**
- `message channel:<channel> message:<text> [embed:true/false]` — sends a
  message to any channel as the bot. `@everyone`/`@here` only actually ping
  if the person running the command has the Mention Everyone permission;
  role mentions only ping if they have Manage Roles. Requires Manage
  Messages to use at all.

## New files

```
commands/
  role.js, poll.js, remindme.js, afk.js, autorole.js, welcome.js,
  setmodlog.js, eightball.js, coinflip.js, dice.js, botinfo.js,
  ping.js, avatar.js, banner.js, userinfo.js, serverinfo.js,
  roleinfo.js, channelinfo.js, message.js, prefix.js,
  userlock.js, userunlock.js, whitelist.js
utils/
  commandContext.js   — lets prefix messages call the same execute()
                         functions written for slash interactions
  prefixStore.js       — per-server prefix storage (prefixes.json)
  guildConfigStore.js  — per-server config: autorole, welcome, mod-log
                         override (guildConfig.json)
  afkStore.js           — in-memory AFK status
  reminderStore.js      — reminder persistence (reminders.json)
  reminderScheduler.js  — schedules/reschedules reminder timers
  appealStore.js        — tracks each user's current appeal invite code
                          (appeals.json)
  appealInvites.js       — issues/revokes single-use appeal-server invites
  appealOption.js         — shared "appeal" option resolution + admin gate
```

`utils/modLog.js` was extended to check for a per-server channel override
(set via `/setmodlog`) before falling back to its original name-based lookup
— nothing about its existing behavior changed if you never use that command.

## How the prefix system works, if you're curious

Every command is written once, against `interaction.options.getX()` calls,
same as before. When someone uses the prefix version instead, `index.js`
builds a lightweight object (`PrefixContext`) that exposes the exact same
`.options.getX()`, `.reply()`, `.guild`, `.user`, etc. methods a real slash
interaction has — so command files never had to be rewritten. It reads each
command's declared slash options (in order) and maps the typed-out words
onto them, resolving `@mentions`, `#channel` mentions, and role mentions
automatically.
