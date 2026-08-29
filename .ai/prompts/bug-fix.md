# Bug Fix Prompt

## Instructions for AI Agent

You are fixing a bug. Follow these steps.

### Step 1 — Reproduce
- Understand the reported issue.
- Identify how to reproduce it.
- Confirm the failure with tests if possible.

### Step 2 — Investigate
- Read the error message and stack trace.
- Inspect the code path involved.
- Identify the root cause.
- Do NOT guess — verify.

### Step 3 — Plan the Fix
- Explain the root cause.
- Explain the fix.
- Identify affected files.
- Note any related areas to check.

### Step 4 — Implement
- Fix the root cause, not symptoms.
- Do not change unrelated code.
- Write a test that catches this bug.

### Step 5 — Verify
- Run `pnpm typecheck`
- Run `pnpm test`
- Run `pnpm lint`
- Confirm the bug is fixed.

### Step 6 — Document
- Update relevant documentation if the bug reveals a design issue.
- Record the fix in commit message.
