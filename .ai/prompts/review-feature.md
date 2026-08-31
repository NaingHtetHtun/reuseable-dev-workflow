# Review Feature Prompt

## Instructions for AI Agent

You are reviewing an implemented feature. Follow these steps.

### Step 1 — Understand What Was Changed

- Read the feature documentation in `docs/features/`.
- Review the changed files.
- Understand the intended behavior.

### Step 2 — Verify Implementation

- Does the code match the approved plan?
- Are there scope deviations?
- Is the architecture consistent with project principles?

### Step 3 — Check Quality

- Run `pnpm typecheck`
- Run `pnpm test`
- Run `pnpm lint`
- Run `pnpm format`

### Step 4 — Check Code Quality

- Are files reasonably sized?
- Is there dead code?
- Is there duplicated logic?
- Are imports clean?
- Are there unnecessary dependencies?

### Step 5 — Check Security

- No hard-coded secrets?
- Input validated?
- No sensitive data in logs?

### Step 6 — Check Documentation

- Feature doc exists and is accurate?
- Status is correct?
- Changes documented?

### Step 7 — Report

Provide a structured review with:

- PASS / FAIL for each check
- Specific issues found
- Suggested improvements
- Overall recommendation: APPROVE / REQUEST_CHANGES
