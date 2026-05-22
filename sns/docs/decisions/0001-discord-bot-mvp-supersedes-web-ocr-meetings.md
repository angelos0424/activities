# Decision 0001: Discord Bot MVP Supersedes Web/OCR/Meeting Roadmap

## Status

Accepted for the current local Discord bot MVP.

## Context

The repository previously described a web application MVP centered on browser
receipt uploads, OCR extraction, meeting transcript analysis/search, and report
screens. That plan is still useful history, but it is too broad for the current
execution queue.

The current local Discord bot MVP needs the cheapest useful automation path first: a Discord
bot used through slash commands in configured channels.

## Decision

Prioritize the Discord bot MVP.

- Build command contracts, channel guardrails, command routing, response
  formatting, and one no-side-effect smoke command first.
- Keep web app screens, OCR provider implementation, meeting transcript
  analysis/search, and browser report screens deferred.
- Preserve the old plan in root docs as legacy context so it is not confused
  with active work.

## Re-entry Conditions

A deferred legacy item can return to active scope only when a future issue:

1. names the domain that needs it,
2. explains why Discord bot MVP needs it now,
3. defines the smallest user-facing workflow,
4. includes targeted validation.

## Consequences

- The active MVP can avoid building a separate web surface before Discord usage
  is proven.
- Receipt and meeting capabilities may still exist later, but they should enter
  through Discord command workflows first.
- Existing frontend/backend scaffold files remain historical setup work, not the
  current product target.
