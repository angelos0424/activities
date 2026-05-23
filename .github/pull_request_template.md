## Summary
<!-- What changed? Keep this short and concrete. -->
- 

## Linked Issue
<!-- Required for Symphony/full-auto bookkeeping. Use a closing keyword when this PR completes the issue. -->
Closes #

## Symphony Metadata
<!-- Required when this PR belongs to a Symphony-managed issue. After creating the PR, update the linked issue body with the same Target-PR / Target-Branch / Existing PR values so In Review follow-up and reviewbot feedback can be picked up. -->
- Service: <sns | receipt | todo>
- Target-PR: <PR number>
- Target-Branch: <branch name>
- Existing PR: <PR URL>

## Scope
<!-- Check all that apply. -->
- [ ] sns
- [ ] recipe
- [ ] todo
- [ ] docs/config/shared

## Validation
<!-- List exact commands or checks run. -->
- [ ] `git diff --check`
- [ ] Tests/lint/build: 

## Review / Full-auto Checklist
- [ ] PR title starts with the service prefix when applicable: `[sns]`, `[recipe]`, or `[todo]`
- [ ] PR body includes `Closes #<issue-number>` or explains why there is no linked issue
- [ ] Linked issue is moved to `In Review` when the PR is ready for review
- [ ] Linked issue body contains `Target-PR`, `Target-Branch`, and `Existing PR`
- [ ] Reviewbot comments are only actionable through configured full-auto review feedback or explicit `@Task`
