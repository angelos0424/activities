import type { ChatInputCommandInteraction, InteractionReplyOptions } from "discord.js";
import type { BotConfig } from "../../shared/config/env.js";
import type { Logger } from "../../shared/logger/logger.js";
import { canUseSnsCommand } from "../permissions/channelGuard.js";
import type { PostCommandHandler } from "../../domains/sns/post.js";

export interface CommandRouterDependencies {
  config: BotConfig;
  logger: Logger;
  postHandler: PostCommandHandler;
}

export interface CommandInteractionBoundary {
  commandName: string;
  channelId: string | null;
  guildId: string | null;
  id: string;
  user: {
    id: string;
  };
  reply(options: InteractionReplyOptions): Promise<unknown>;
}

export async function routeChatInputCommand(
  interaction: CommandInteractionBoundary,
  deps: CommandRouterDependencies,
): Promise<void> {
  if (interaction.commandName !== "post") {
    await interaction.reply({
      content: "지원하지 않는 command입니다.",
      ephemeral: true,
    });
    return;
  }

  const guard = canUseSnsCommand(interaction.channelId, {
    snsChannelIds: deps.config.discord.snsChannelIds,
  });

  if (!guard.allowed) {
    await interaction.reply({
      content: guard.reason ?? "이 채널에서는 `/post`를 실행할 수 없습니다.",
      ephemeral: true,
    });
    return;
  }

  try {
    const response = await deps.postHandler.startPost({
      requesterId: interaction.user.id,
      interactionId: interaction.id,
      guildId: interaction.guildId,
      channelId: interaction.channelId,
    });

    deps.logger.info("sns post command routed", {
      interactionId: interaction.id,
      guildId: interaction.guildId,
      channelId: interaction.channelId,
      requesterId: interaction.user.id,
    });

    await interaction.reply(response);
  } catch (error) {
    deps.logger.error("sns post command failed", {
      interactionId: interaction.id,
      error: error instanceof Error ? error.message : String(error),
    });
    await interaction.reply({
      content: "게시물 flow를 시작하지 못했습니다. 잠시 후 다시 시도해주세요.",
      ephemeral: true,
    });
  }
}

export async function routeDiscordChatInputCommand(
  interaction: ChatInputCommandInteraction,
  deps: CommandRouterDependencies,
): Promise<void> {
  await routeChatInputCommand(interaction, deps);
}
