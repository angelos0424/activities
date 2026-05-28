export type SnsPostTarget = "instagram" | "facebook" | "homepage";

export type SnsTargetAttemptStatus = "success" | "failed" | "manual_required" | "skipped";

export type SnsTargetStatus =
  | "pending"
  | "processing"
  | SnsTargetAttemptStatus;

export type SnsPostStatus =
  | "draft"
  | "processing"
  | "partial_success"
  | "success"
  | "failed";

export interface SnsPostRecordInput {
  postId: string;
  discordGuildId: string;
  discordChannelId: string;
  requestedBy: string;
  title: string;
  content: string;
  homepageType?: string | null;
  targets: SnsPostTarget[];
  attempts: SnsTargetAttemptInput[];
  now: string;
}

export interface SnsTargetAttemptInput {
  target: SnsPostTarget;
  attemptNumber: number;
  status: SnsTargetAttemptStatus;
  resultUrl?: string | null;
  safeErrorMessage?: string | null;
}

export interface SnsPostRecord {
  id: string;
  discordGuildId: string;
  discordChannelId: string;
  requestedBy: string;
  title: string;
  content: string;
  homepageType: string | null;
  status: SnsPostStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SnsPostTargetRecord {
  id: string;
  postId: string;
  target: SnsPostTarget;
  status: SnsTargetStatus;
  resultUrl: string | null;
  safeErrorMessage: string | null;
  retryCount: number;
  updatedAt: string;
}

export interface SnsPostTargetAttemptRecord {
  id: string;
  postTargetId: string;
  postId: string;
  target: SnsPostTarget;
  attemptNumber: number;
  status: SnsTargetAttemptStatus;
  resultUrl: string | null;
  safeErrorMessage: string | null;
  createdAt: string;
}

export interface SnsPostTrackingSnapshot {
  post: SnsPostRecord;
  targets: SnsPostTargetRecord[];
  targetAttempts: SnsPostTargetAttemptRecord[];
}

const maxRetryCount = 3;

export function buildSnsPostTrackingSnapshot(input: SnsPostRecordInput): SnsPostTrackingSnapshot {
  const attempts = input.attempts.map((attempt) => {
    if (attempt.attemptNumber < 1) {
      throw new Error(`Invalid attempt number: ${attempt.attemptNumber}. Must be >= 1.`);
    }

    return {
      ...attempt,
      resultUrl: attempt.resultUrl ?? null,
      safeErrorMessage: attempt.safeErrorMessage ?? null,
    };
  });
  const latestAttempts = latestAttemptByTarget(attempts);
  const targets = input.targets.map((targetName) => {
    const attempt = latestAttempts.get(targetName);
    if (attempt) {
      return buildTargetRecord(input.postId, attempt, input.now);
    }

    return {
      id: buildPostTargetId(input.postId, targetName),
      postId: input.postId,
      target: targetName,
      status: "pending" as const,
      resultUrl: null,
      safeErrorMessage: null,
      retryCount: 0,
      updatedAt: input.now,
    };
  });

  return {
    post: {
      id: input.postId,
      discordGuildId: input.discordGuildId,
      discordChannelId: input.discordChannelId,
      requestedBy: input.requestedBy,
      title: input.title,
      content: input.content,
      homepageType: input.homepageType ?? null,
      status: derivePostStatus(targets),
      createdAt: input.now,
      updatedAt: input.now,
    },
    targets,
    targetAttempts: attempts.map((attempt) => ({
      id: buildAttemptId(input.postId, attempt.target, attempt.attemptNumber),
      postTargetId: buildPostTargetId(input.postId, attempt.target),
      postId: input.postId,
      target: attempt.target,
      attemptNumber: attempt.attemptNumber,
      status: attempt.status,
      resultUrl: attempt.resultUrl,
      safeErrorMessage: attempt.safeErrorMessage,
      createdAt: input.now,
    })),
  };
}

export function derivePostStatus(targets: SnsPostTargetRecord[]): SnsPostStatus {
  if (targets.length === 0) return "draft";
  if (targets.every((target) => target.status === "skipped")) return "draft";
  if (targets.every((target) => target.status === "success")) return "success";

  const activeTargets = targets.filter((target) => target.status !== "skipped");
  const hasSuccess = activeTargets.some((target) => target.status === "success");
  const allActiveTargetsTerminal = activeTargets.every((target) =>
    target.status === "success" || target.status === "failed" || target.status === "manual_required",
  );

  if (hasSuccess && allActiveTargetsTerminal) return "partial_success";
  if (allActiveTargetsTerminal && activeTargets.every((target) => target.status !== "success")) {
    return "failed";
  }

  return "processing";
}

export function findRetryableTargets(
  targets: SnsPostTargetRecord[],
): SnsPostTargetRecord[] {
  return targets.filter((target) => target.status === "failed" && target.retryCount < maxRetryCount);
}

function latestAttemptByTarget(
  attempts: Array<SnsTargetAttemptInput & { resultUrl: string | null; safeErrorMessage: string | null }>,
): Map<SnsPostTarget, SnsTargetAttemptInput & { resultUrl: string | null; safeErrorMessage: string | null }> {
  const latestAttempts = new Map<
    SnsPostTarget,
    SnsTargetAttemptInput & { resultUrl: string | null; safeErrorMessage: string | null }
  >();

  for (const attempt of attempts) {
    const current = latestAttempts.get(attempt.target);
    if (!current || attempt.attemptNumber > current.attemptNumber) {
      latestAttempts.set(attempt.target, attempt);
    }
  }

  return latestAttempts;
}

function buildTargetRecord(
  postId: string,
  attempt: SnsTargetAttemptInput & { resultUrl: string | null; safeErrorMessage: string | null },
  now: string,
): SnsPostTargetRecord {
  return {
    id: buildPostTargetId(postId, attempt.target),
    postId,
    target: attempt.target,
    status: attempt.status,
    resultUrl: attempt.resultUrl,
    safeErrorMessage: attempt.safeErrorMessage,
    retryCount: Math.max(0, attempt.attemptNumber - 1),
    updatedAt: now,
  };
}

function buildPostTargetId(postId: string, target: SnsPostTarget): string {
  return `${postId}:${target}`;
}

function buildAttemptId(postId: string, target: SnsPostTarget, attemptNumber: number): string {
  return `${buildPostTargetId(postId, target)}:${attemptNumber}`;
}
