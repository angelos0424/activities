# SNS Environment Variables

Copy `sns/.env.example` to `sns/.env` for local development. Keep real tokens,
secrets, and Google service account JSON files out of git.

## Discord

| Variable | Required | Description |
| --- | --- | --- |
| `DISCORD_TOKEN` | Yes | Discord bot token used to authenticate the bot runtime. Treat this as a secret. |
| `DISCORD_CLIENT_ID` | Yes | Discord application client ID used when registering slash commands. |
| `DISCORD_GUILD_ID` | Yes | Discord guild/server ID where MVP commands are registered and tested. |
| `DISCORD_ALLOWED_CHANNEL_IDS` | Yes | Comma-separated Discord channel IDs where bot commands are allowed to run. |

## Google Sheets

| Variable | Required | Description |
| --- | --- | --- |
| `GOOGLE_APPLICATION_CREDENTIALS` | Yes, when Sheets is enabled | Local path to the Google service account JSON credential file. Do not commit the JSON file. |
| `GOOGLE_SPREADSHEET_ID` | Yes, when Sheets is enabled | Spreadsheet ID used as the candidate Google Sheets backing store for MVP records. |
