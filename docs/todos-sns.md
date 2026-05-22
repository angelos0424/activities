# TODO: SNS Upload Service

Related PRD: `docs/prd-sns.md`

Goal: Build the first product slice around Discord-based SNS upload in `#sns`.

## Discovery

- [ ] Confirm homepage upload target.
  - What CMS/API/admin flow does the homepage use?
  - Can notice/gallery be created through an API?

- [ ] Confirm Meta account feasibility.
  - Is Instagram a professional/business account?
  - Is Facebook a Page?
  - Are app review and publishing permissions realistic for this team?

- [ ] Decide Discord file input pattern.
  - Preferred: Discord modal file upload if the chosen SDK supports it.
  - Fallback: `/post` opens a flow, then user replies with attachments.

## Product Design

- [x] Design command contract.
  - `/post`
  - target channels: instagram, facebook, homepage
  - homepage type: notice, gallery
  - title/content
  - multiple image/mp4 files
  - No generic `links` field in the initial confirmed payload.
  - Optional `audio` metadata remains provider-dependent.
  - Source: `docs/discord-command-spec.md`, folded in from local `SNS_POST_REQUIREMENTS.md`.

- [x] Define result tracking.
  - Per-channel status.
  - Result URL.
  - Failure reason.
  - Retry action.
  - Source: `docs/data-schema.md`.

## Engineering Planning

- [x] Decide persistence.
  - Database table.
  - Google Sheet log.
  - Hybrid: DB source of truth + Sheet export.
  - Initial MVP decision: SQLite for bot state and SNS request tracking.

- [ ] Decide upload adapter scope.
  - Homepage automatic upload first.
  - Instagram/Facebook automatic upload only if account/API permissions are ready.
  - Manual upload packet fallback for channels without API access.

- [x] Define failure behavior.
  - Pre-submit validation failure stops the whole request with suggested fixes.
  - After upload starts, one target failure should not block already successful targets.
  - Failed channels should be retryable independently.
  - User-facing error must not expose secrets or raw provider responses.
  - Source: `docs/discord-command-spec.md`.

## Validation

- [ ] Run `/post` in `#sns` in a test Discord server.
- [ ] Submit title/content/channel selections.
- [ ] Upload multiple image/mp4 attachments.
- [ ] Confirm per-channel results are returned.
- [ ] Confirm all attempts are recorded.
