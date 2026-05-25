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

const redactedValue = "[redacted]";
const circularValue = "[circular]";
const sensitiveKeyPattern = /(token|secret|key|password|auth)/i;

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

    const line = safeStringify(payload);
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

function safeStringify(payload: Record<string, unknown>): string {
  try {
    return JSON.stringify(payload);
  } catch (error) {
    return JSON.stringify({
      level: "error",
      message: "Failed to serialize log payload",
      serializationError: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
  }
}

function redactMeta(meta: Record<string, unknown> | undefined): Record<string, unknown> {
  if (!meta) return {};

  return redactRecord(meta, new WeakSet<object>());
}

function redactRecord(meta: Record<string, unknown>, seen: WeakSet<object>): Record<string, unknown> {
  if (seen.has(meta)) return { circular: circularValue };
  seen.add(meta);

  return Object.fromEntries(
    Object.entries(meta).map(([key, value]) => [
      key,
      sensitiveKeyPattern.test(key) ? redactedValue : redactValue(value, seen),
    ]),
  );
}

function redactValue(value: unknown, seen: WeakSet<object>): unknown {
  if (typeof value === "bigint") return value.toString();
  if (value === null || typeof value !== "object") return value;
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }
  if (Array.isArray(value)) {
    if (seen.has(value)) return circularValue;
    seen.add(value);
    return value.map((item) => redactValue(item, seen));
  }

  return redactRecord(value as Record<string, unknown>, seen);
}
