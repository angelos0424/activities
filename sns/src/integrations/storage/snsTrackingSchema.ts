export const snsTrackingTableNames = [
  "sns_posts",
  "sns_post_targets",
  "sns_post_target_attempts",
] as const;

export const snsTrackingSchemaStatements = [
  `CREATE TABLE IF NOT EXISTS sns_posts (
    id text PRIMARY KEY,
    discord_guild_id text NOT NULL,
    discord_channel_id text NOT NULL,
    requested_by text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    homepage_type text,
    status text NOT NULL CHECK (status IN ('draft', 'processing', 'partial_success', 'success', 'failed')),
    created_at text NOT NULL,
    updated_at text NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS sns_post_targets (
    id text PRIMARY KEY,
    post_id text NOT NULL,
    target text NOT NULL CHECK (target IN ('instagram', 'facebook', 'homepage')),
    status text NOT NULL CHECK (status IN ('pending', 'processing', 'success', 'failed', 'manual_required', 'skipped')),
    result_url text,
    safe_error_message text,
    retry_count integer NOT NULL DEFAULT 0 CHECK (retry_count >= 0 AND retry_count <= 3),
    updated_at text NOT NULL,
    UNIQUE (post_id, target),
    FOREIGN KEY (post_id) REFERENCES sns_posts(id)
  )`,
  `CREATE TABLE IF NOT EXISTS sns_post_target_attempts (
    id text PRIMARY KEY,
    post_target_id text NOT NULL,
    post_id text NOT NULL,
    target text NOT NULL CHECK (target IN ('instagram', 'facebook', 'homepage')),
    attempt_number integer NOT NULL CHECK (attempt_number >= 1),
    status text NOT NULL CHECK (status IN ('success', 'failed', 'manual_required', 'skipped')),
    result_url text,
    safe_error_message text,
    created_at text NOT NULL,
    UNIQUE (post_target_id, attempt_number),
    FOREIGN KEY (post_target_id) REFERENCES sns_post_targets(id),
    FOREIGN KEY (post_id) REFERENCES sns_posts(id)
  )`,
] as const;
