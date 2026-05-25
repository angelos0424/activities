import "dotenv/config";
import { listMissingRuntimeConfig, loadBotConfig } from "./shared/config/env.js";

const config = loadBotConfig(undefined, {
  requireSecrets: false,
  requireAllowlist: false,
});
const missing = listMissingRuntimeConfig();

console.log("Discord bot config shape is valid.");
console.log(`Command scope: ${config.discord.commandScope}`);
console.log(`SNS allowlisted channels: ${config.discord.snsChannelIds.length}`);

if (missing.length > 0) {
  console.log(`Missing runtime values: ${missing.join(", ")}`);
  console.log("Add these values to .env before starting the bot or syncing commands.");
}
