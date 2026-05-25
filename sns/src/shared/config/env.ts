export type CommandScope = "guild" | "global";

export interface DiscordRuntimeConfig {
  token?: string;
  clientId?: string;
  guildId?: string;
  commandScope: CommandScope;
  snsChannelIds: string[];
}

export interface BotConfig {
  discord: DiscordRuntimeConfig;
  logLevel: "debug" | "info" | "warn" | "error";
}

export interface ConfigLoadOptions {
  requireSecrets?: boolean;
  requireAllowlist?: boolean;
}

export class ConfigError extends Error {
  public readonly missing: string[];

  constructor(missing: string[]) {
    super(`Missing required Discord bot config: ${missing.join(", ")}`);
    this.missing = missing;
    this.name = "ConfigError";
  }
}

type Env = Record<string, string | undefined>;

export function loadBotConfig(
  env: Env = process.env,
  options: ConfigLoadOptions = {},
): BotConfig {
  const requireSecrets = options.requireSecrets ?? true;
  const requireAllowlist = options.requireAllowlist ?? true;
  const commandScope = parseCommandScope(env.DISCORD_COMMAND_SCOPE);
  const snsChannelIds = parseCsvIds(
    emptyToUndefined(env.DISCORD_SNS_CHANNEL_IDS) ?? env.DISCORD_ALLOWED_CHANNEL_IDS,
  );
  const missing: string[] = [];

  if (requireSecrets) {
    requireValue(env.DISCORD_TOKEN, "DISCORD_TOKEN", missing);
    requireValue(env.DISCORD_CLIENT_ID, "DISCORD_CLIENT_ID", missing);
    if (commandScope === "guild") {
      requireValue(env.DISCORD_GUILD_ID, "DISCORD_GUILD_ID", missing);
    }
  }

  if (requireAllowlist && snsChannelIds.length === 0) {
    missing.push("DISCORD_SNS_CHANNEL_IDS");
  }

  if (missing.length > 0) {
    throw new ConfigError(missing);
  }

  return {
    discord: {
      token: emptyToUndefined(env.DISCORD_TOKEN),
      clientId: emptyToUndefined(env.DISCORD_CLIENT_ID),
      guildId: emptyToUndefined(env.DISCORD_GUILD_ID),
      commandScope,
      snsChannelIds,
    },
    logLevel: parseLogLevel(env.LOG_LEVEL),
  };
}

export function listMissingRuntimeConfig(env: Env = process.env): string[] {
  const config = loadBotConfig(env, {
    requireSecrets: false,
    requireAllowlist: false,
  });
  const missing: string[] = [];

  if (!config.discord.token) missing.push("DISCORD_TOKEN");
  if (!config.discord.clientId) missing.push("DISCORD_CLIENT_ID");
  if (config.discord.commandScope === "guild" && !config.discord.guildId) {
    missing.push("DISCORD_GUILD_ID");
  }
  if (config.discord.snsChannelIds.length === 0) {
    missing.push("DISCORD_SNS_CHANNEL_IDS");
  }

  return missing;
}

function parseCommandScope(value: string | undefined): CommandScope {
  if (value === undefined || value.trim() === "") return "guild";
  if (value === "guild" || value === "global") return value;
  throw new Error("DISCORD_COMMAND_SCOPE must be guild or global");
}

function parseLogLevel(value: string | undefined): BotConfig["logLevel"] {
  if (value === "debug" || value === "info" || value === "warn" || value === "error") {
    return value;
  }
  return "info";
}

function parseCsvIds(value: string | undefined): string[] {
  if (!value) return [];

  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

function requireValue(value: string | undefined, name: string, missing: string[]): void {
  if (emptyToUndefined(value) === undefined) {
    missing.push(name);
  }
}

function emptyToUndefined(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}
