import { REST, Routes } from "discord.js";
import type { BotConfig } from "../../shared/config/env.js";
import type { Logger } from "../../shared/logger/logger.js";
import { commandDefinitionsJson } from "../../bot/commands/definitions.js";

export async function registerDiscordCommands(config: BotConfig, logger: Logger): Promise<void> {
  const { token, clientId, guildId, commandScope } = config.discord;

  if (!token) throw new Error("DISCORD_TOKEN is required to register commands");
  if (!clientId) throw new Error("DISCORD_CLIENT_ID is required to register commands");
  if (commandScope === "guild" && !guildId) {
    throw new Error("DISCORD_GUILD_ID is required for guild command registration");
  }

  const rest = new REST({ version: "10" }).setToken(token);
  const commands = commandDefinitionsJson();
  const route =
    commandScope === "global"
      ? Routes.applicationCommands(clientId)
      : Routes.applicationGuildCommands(clientId, guildId as string);

  await rest.put(route, { body: commands });

  logger.info("discord application commands registered", {
    commandScope,
    guildId: commandScope === "guild" ? guildId : undefined,
    count: commands.length,
  });
}
