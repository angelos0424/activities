import "dotenv/config";
import { loadBotConfig } from "./shared/config/env.js";
import { createLogger } from "./shared/logger/logger.js";
import { registerDiscordCommands } from "./integrations/discord/registerCommands.js";

const config = loadBotConfig(process.env, { requireAllowlist: false });
const logger = createLogger(config.logLevel);

registerDiscordCommands(config, logger).catch((error) => {
  logger.error("discord command registration failed", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exitCode = 1;
});
