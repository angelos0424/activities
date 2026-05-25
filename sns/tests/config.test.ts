import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ConfigError, listMissingRuntimeConfig, loadBotConfig } from "../src/shared/config/env.js";

describe("loadBotConfig", () => {
  it("validates config shape without requiring Discord secrets", () => {
    const config = loadBotConfig(
      {
        DISCORD_COMMAND_SCOPE: "guild",
        DISCORD_SNS_CHANNEL_IDS: "111, 222",
      },
      {
        requireSecrets: false,
      },
    );

    assert.equal(config.discord.commandScope, "guild");
    assert.deepEqual(config.discord.snsChannelIds, ["111", "222"]);
  });

  it("reports missing runtime values without exposing secret contents", () => {
    const missing = listMissingRuntimeConfig({
      DISCORD_COMMAND_SCOPE: "guild",
      DISCORD_SNS_CHANNEL_IDS: "111",
    });

    assert.deepEqual(missing, ["DISCORD_TOKEN", "DISCORD_CLIENT_ID", "DISCORD_GUILD_ID"]);
  });

  it("requires sns channel allowlist when runtime validation is strict", () => {
    assert.throws(
      () =>
        loadBotConfig({
          DISCORD_TOKEN: "token",
          DISCORD_CLIENT_ID: "client",
          DISCORD_GUILD_ID: "guild",
        }),
      (error) => error instanceof ConfigError && error.missing.includes("DISCORD_SNS_CHANNEL_IDS"),
    );
  });

  it("falls back to legacy channel allowlist when sns allowlist is empty", () => {
    const config = loadBotConfig(
      {
        DISCORD_COMMAND_SCOPE: "guild",
        DISCORD_SNS_CHANNEL_IDS: "",
        DISCORD_ALLOWED_CHANNEL_IDS: "legacy-channel",
      },
      {
        requireSecrets: false,
      },
    );

    assert.deepEqual(config.discord.snsChannelIds, ["legacy-channel"]);
  });

  it("uses a direct validation error for invalid command scope", () => {
    assert.throws(
      () =>
        loadBotConfig(
          {
            DISCORD_COMMAND_SCOPE: "workspace",
          },
          {
            requireSecrets: false,
            requireAllowlist: false,
          },
        ),
      /^Error: DISCORD_COMMAND_SCOPE must be guild or global$/,
    );
  });
});
