import type { BotConfig } from "../config/env.js";

type LogLevel = BotConfig["logLevel"];

const levelWeights: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

export interface Logger {
  debug(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
}

export function createLogger(level: LogLevel): Logger {
  const shouldLog = (candidate: LogLevel) => levelWeights[candidate] >= levelWeights[level];

  const emit = (candidate: LogLevel, message: string, meta?: Record<string, unknown>) => {
    if (!shouldLog(candidate)) return;

    const payload = {
      level: candidate,
      message,
      ...redactMeta(meta),
      timestamp: new Date().toISOString(),
    };

    const line = JSON.stringify(payload);
    if (candidate === "error") {
      console.error(line);
    } else {
      console.log(line);
    }
  };

  return {
    debug: (message, meta) => emit("debug", message, meta),
    info: (message, meta) => emit("info", message, meta),
    warn: (message, meta) => emit("warn", message, meta),
    error: (message, meta) => emit("error", message, meta),
  };
}

function redactMeta(meta: Record<string, unknown> | undefined): Record<string, unknown> {
  if (!meta) return {};

  return Object.fromEntries(
    Object.entries(meta).map(([key, value]) => [
      key,
      key.toLowerCase().includes("token") ? "[redacted]" : value,
    ]),
  );
}
