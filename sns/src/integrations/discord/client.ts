import { Client, Events, GatewayIntentBits } from "discord.js";
import type { BotConfig } from "../../shared/config/env.js";
import type { Logger } from "../../shared/logger/logger.js";
import { SnsPostCommandHandler } from "../../domains/sns/post.js";
import { routeDiscordChatInputCommand } from "../../bot/commands/router.js";

export interface DiscordBotRuntime {
  client: Client;
  start(): Promise<void>;
}

export function createDiscordBotRuntime(config: BotConfig, logger: Logger): DiscordBotRuntime {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
  });
  const postHandler = new SnsPostCommandHandler();

  client.once(Events.ClientReady, (readyClient) => {
    logger.info("discord bot ready", {
      userId: readyClient.user.id,
      commandScope: config.discord.commandScope,
    });
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    await routeDiscordChatInputCommand(interaction, {
      config,
      logger,
      postHandler,
    });
  });

  return {
    client,
    async start() {
      if (!config.discord.token) {
        throw new Error("DISCORD_TOKEN is required to start the bot");
      }

      await client.login(config.discord.token);
    },
  };
}
