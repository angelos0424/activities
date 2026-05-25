import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { createLogger } from "../src/shared/logger/logger.js";

const originalLog = console.log;
const originalError = console.error;

afterEach(() => {
  console.log = originalLog;
  console.error = originalError;
});

describe("createLogger", () => {
  it("redacts nested sensitive metadata before writing JSON logs", () => {
    const lines: string[] = [];
    console.log = (line?: unknown) => {
      lines.push(String(line));
    };

    const logger = createLogger("debug");
    logger.info("configured", {
      token: "top-secret-token",
      nested: {
        apiKey: "top-secret-key",
        password: "top-secret-password",
      },
      request: {
        authHeader: "Bearer secret",
      },
      safe: "visible",
    });

    const payload = JSON.parse(lines[0] ?? "{}");

    assert.equal(payload.token, "[redacted]");
    assert.equal(payload.nested.apiKey, "[redacted]");
    assert.equal(payload.nested.password, "[redacted]");
    assert.equal(payload.request.authHeader, "[redacted]");
    assert.equal(payload.safe, "visible");
    assert.doesNotMatch(lines[0] ?? "", /top-secret|Bearer secret/);
  });

  it("does not throw when metadata contains circular references", () => {
    const lines: string[] = [];
    console.log = (line?: unknown) => {
      lines.push(String(line));
    };

    const meta: Record<string, unknown> = {
      name: "circular",
    };
    meta.self = meta;

    const logger = createLogger("debug");

    assert.doesNotThrow(() => {
      logger.info("circular metadata", meta);
    });
    assert.equal(JSON.parse(lines[0] ?? "{}").self.circular, "[circular]");
  });
});
