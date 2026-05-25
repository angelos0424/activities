# Activities Discord Bot

Runtime workspace for the local Activities Discord bot migration.

This workspace owns Discord bot entry points, `sns-manager`/`receipt-manager`/`todo-manager`
domains, external integrations, and shared utilities used by the local bot.

## Local Setup

```bash
cd sns
npm install
cp .env.example .env
npm run config:check
```

`npm run config:check` validates the config shape without requiring a Discord token.
It prints the missing runtime variable names only, never secret values.

Required runtime values:

| Variable | Purpose |
| --- | --- |
| `DISCORD_TOKEN` | Bot token used only at runtime. |
| `DISCORD_CLIENT_ID` | Discord application client id. |
| `DISCORD_GUILD_ID` | Test server id when `DISCORD_COMMAND_SCOPE=guild`. |
| `DISCORD_SNS_CHANNEL_IDS` | Comma-separated channel ids where `/post` is allowed. |
| `DISCORD_COMMAND_SCOPE` | `guild` for local/test server sync, `global` for global commands. |

## Commands

Register the `/post` slash command in a test guild:

```bash
cd sns
npm run register-commands
```

Start the bot runtime:

```bash
cd sns
npm run start
```

The current `/post` implementation verifies the `#sns` channel allowlist and routes
to the `sns-manager` domain boundary. Target select, modal submission, and file
attachment collection are intentionally split behind interfaces for follow-up work.

## Validation

```bash
cd sns
npm test
```

The test path does not require Discord credentials.
