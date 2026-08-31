# Dependency Review Prompt

## Instructions for AI Agent

You are reviewing or adding a dependency. Follow these steps.

### Step 1 — Identify Need

- What capability is needed?
- Does the project already have this?

### Step 2 — Research

- Find the official package documentation.
- Check the current stable version.
- Check security advisories.
- Check license.
- Check maintenance status.

### Step 3 — Evaluate

- Is there a simpler existing solution?
- Does this align with project architecture?
- What is the bundle/install size impact?
- Does it introduce transitive dependency concerns?

### Step 4 — Document

- Add the rationale to the feature plan.
- Record version and documentation reference.

### Step 5 — Await Approval

- If the dependency materially affects architecture, wait for human approval.
- If it's a minor dev dependency, proceed with caution.

### Step 6 — Install and Verify

- Install the dependency.
- Run `pnpm typecheck`.
- Run `pnpm test`.
- Verify no regressions.
