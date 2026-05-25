import "dotenv/config";
import { loadBotConfig } from "./shared/config/env.js";
import { createLogger } from "./shared/logger/logger.js";
import { createDiscordBotRuntime } from "./integrations/discord/client.js";

const config = loadBotConfig();
const logger = createLogger(config.logLevel);
const runtime = createDiscordBotRuntime(config, logger);

runtime.start().catch((error) => {
  logger.error("discord bot startup failed", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exitCode = 1;
});
