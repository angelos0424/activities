import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { InteractionReplyOptions } from "discord.js";
import { routeChatInputCommand, type CommandInteractionBoundary } from "../src/bot/commands/router.js";
import type { BotConfig } from "../src/shared/config/env.js";
import type { Logger } from "../src/shared/logger/logger.js";
import type { PostCommandHandler } from "../src/domains/sns/post.js";
import type { PostCommandInput } from "../src/domains/sns/post.js";

const logger: Logger = {
  debug: () => undefined,
  info: () => undefined,
  warn: () => undefined,
  error: () => undefined,
};

const config: BotConfig = {
  discord: {
    commandScope: "guild",
    snsChannelIds: ["sns-channel"],
  },
  logLevel: "info",
};

describe("routeChatInputCommand", () => {
  it("rejects /post outside the sns allowlist before calling the domain", async () => {
    const replies: InteractionReplyOptions[] = [];
    const handler = createPostHandler();

    await routeChatInputCommand(createInteraction("wrong-channel", replies), {
      config,
      logger,
      postHandler: handler,
    });

    assert.equal(handler.calls.length, 0);
    assert.equal(replies[0]?.ephemeral, true);
    assert.match(String(replies[0]?.content), /#sns/);
  });

  it("routes allowed /post commands to the sns domain handler", async () => {
    const replies: InteractionReplyOptions[] = [];
    const handler = createPostHandler();

    await routeChatInputCommand(createInteraction("sns-channel", replies), {
      config,
      logger,
      postHandler: handler,
    });

    assert.equal(handler.calls.length, 1);
    assert.equal(handler.calls[0]?.channelId, "sns-channel");
    assert.equal(replies[0]?.ephemeral, true);
    assert.equal(replies[0]?.content, "domain response");
  });
});

function createInteraction(
  channelId: string,
  replies: InteractionReplyOptions[],
): CommandInteractionBoundary {
  return {
    commandName: "post",
    channelId,
    guildId: "guild",
    id: "interaction",
    user: {
      id: "requester",
    },
    async reply(options) {
      replies.push(options);
    },
  };
}

function createPostHandler(): PostCommandHandler & { calls: PostCommandInput[] } {
  const calls: PostCommandInput[] = [];

  return {
    calls,
    async startPost(input) {
      calls.push(input);
      return {
        content: "domain response",
        ephemeral: true,
      };
    },
  };
}
