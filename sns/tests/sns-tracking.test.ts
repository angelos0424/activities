import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildSnsPostTrackingSnapshot,
  findRetryableTargets,
} from "../src/domains/sns/tracking.js";
import {
  snsTrackingSchemaStatements,
  snsTrackingTableNames,
} from "../src/integrations/storage/snsTrackingSchema.js";

const now = "2026-05-29T00:00:00.000Z";

describe("SNS post request tracking", () => {
  it("records a successful target attempt and derives a successful parent post", () => {
    const snapshot = buildSnsPostTrackingSnapshot({
      ...basePostInput(),
      attempts: [
        {
          target: "homepage",
          attemptNumber: 1,
          status: "success",
          resultUrl: "https://example.test/posts/1",
        },
      ],
    });

    assert.equal(snapshot.post.status, "success");
    assert.deepEqual(snapshot.targets, [
      {
        id: "post-1:homepage",
        postId: "post-1",
        target: "homepage",
        status: "success",
        resultUrl: "https://example.test/posts/1",
        safeErrorMessage: null,
        retryCount: 0,
        updatedAt: now,
      },
    ]);
    assert.deepEqual(snapshot.targetAttempts, [
      {
        id: "post-1:homepage:1",
        postTargetId: "post-1:homepage",
        postId: "post-1",
        target: "homepage",
        attemptNumber: 1,
        status: "success",
        resultUrl: "https://example.test/posts/1",
        safeErrorMessage: null,
        createdAt: now,
      },
    ]);
  });

  it("records a failed target attempt with only a safe error message", () => {
    const snapshot = buildSnsPostTrackingSnapshot({
      ...basePostInput(),
      attempts: [
        {
          target: "instagram",
          attemptNumber: 1,
          status: "failed",
          safeErrorMessage: "Instagram 업로드를 완료하지 못했습니다.",
        },
      ],
    });

    const [target] = snapshot.targets;
    const [attempt] = snapshot.targetAttempts;

    assert.equal(snapshot.post.status, "failed");
    assert.equal(target?.status, "failed");
    assert.equal(target?.safeErrorMessage, "Instagram 업로드를 완료하지 못했습니다.");
    assert.equal(attempt?.safeErrorMessage, "Instagram 업로드를 완료하지 못했습니다.");
    assert.equal("rawResponse" in (attempt ?? {}), false);
    assert.equal("providerRawResponse" in (attempt ?? {}), false);
  });

  it("keeps retry candidates independent by target record", () => {
    const snapshot = buildSnsPostTrackingSnapshot({
      ...basePostInput(),
      attempts: [
        {
          target: "instagram",
          attemptNumber: 2,
          status: "failed",
          safeErrorMessage: "Instagram 업로드를 완료하지 못했습니다.",
        },
        {
          target: "facebook",
          attemptNumber: 1,
          status: "success",
          resultUrl: "https://facebook.test/post/1",
        },
        {
          target: "homepage",
          attemptNumber: 4,
          status: "failed",
          safeErrorMessage: "Homepage 업로드를 완료하지 못했습니다.",
        },
      ],
    });

    assert.deepEqual(
      findRetryableTargets(snapshot.targets).map((target) => target.id),
      ["post-1:instagram"],
    );
    assert.equal(snapshot.targets.find((target) => target.target === "facebook")?.status, "success");
  });

  it("keeps every retry attempt while exposing the latest target state", () => {
    const snapshot = buildSnsPostTrackingSnapshot({
      ...basePostInput(),
      attempts: [
        {
          target: "homepage",
          attemptNumber: 1,
          status: "failed",
          safeErrorMessage: "첫 번째 업로드 시도가 실패했습니다.",
        },
        {
          target: "homepage",
          attemptNumber: 2,
          status: "success",
          resultUrl: "https://example.test/posts/retry-success",
        },
      ],
    });

    assert.equal(snapshot.targetAttempts.length, 2);
    assert.equal(snapshot.targets.length, 1);
    assert.equal(snapshot.targets[0]?.status, "success");
    assert.equal(snapshot.targets[0]?.retryCount, 1);
    assert.equal(snapshot.post.status, "success");
  });

  it("derives partial success when one selected target succeeds and another fails or skips", () => {
    const snapshot = buildSnsPostTrackingSnapshot({
      ...basePostInput(),
      attempts: [
        {
          target: "instagram",
          attemptNumber: 1,
          status: "success",
          resultUrl: "https://instagram.test/post/1",
        },
        {
          target: "facebook",
          attemptNumber: 1,
          status: "failed",
          safeErrorMessage: "Facebook 업로드를 완료하지 못했습니다.",
        },
        {
          target: "homepage",
          attemptNumber: 1,
          status: "skipped",
          safeErrorMessage: "Homepage target이 선택되지 않았습니다.",
        },
      ],
    });

    assert.equal(snapshot.post.status, "partial_success");
  });
});

describe("SNS SQLite tracking schema", () => {
  it("defines parent, latest target, and per-target attempt tables", () => {
    assert.deepEqual(snsTrackingTableNames, [
      "sns_posts",
      "sns_post_targets",
      "sns_post_target_attempts",
    ]);

    const schema = snsTrackingSchemaStatements.join("\n");
    assert.match(schema, /CREATE TABLE IF NOT EXISTS sns_posts/);
    assert.match(schema, /CREATE TABLE IF NOT EXISTS sns_post_targets/);
    assert.match(schema, /CREATE TABLE IF NOT EXISTS sns_post_target_attempts/);
    assert.match(schema, /UNIQUE \(post_target_id, attempt_number\)/);
  });

  it("stores safe errors and result URLs without provider raw responses", () => {
    const schema = snsTrackingSchemaStatements.join("\n").toLowerCase();

    assert.match(schema, /safe_error_message/);
    assert.match(schema, /result_url/);
    assert.doesNotMatch(schema, /raw_response/);
    assert.doesNotMatch(schema, /provider_response/);
    assert.doesNotMatch(schema, /secret/);
  });
});

function basePostInput() {
  return {
    postId: "post-1",
    discordGuildId: "guild-1",
    discordChannelId: "sns-channel",
    requestedBy: "requester-1",
    title: "SNS post title",
    content: "SNS post content",
    homepageType: "notice",
    now,
  };
}
