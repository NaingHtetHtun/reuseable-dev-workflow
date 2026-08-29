# Debugging Skill

## Purpose
Debug issues systematically rather than guessing.

## When to Use
- Investigating failing tests
- Debugging runtime errors
- Investigating unexpected behavior
- Fixing type errors

## Required Behavior
1. Reproduce the issue first.
2. Read the error message carefully.
3. Check the stack trace.
4. Inspect the code path involved.
5. Add targeted logging if needed.
6. Fix the root cause, not symptoms.
7. Verify the fix with tests.

## Things to Inspect
- Error messages and stack traces
- Recent code changes
- Configuration files
- Dependency versions

## Things to Avoid
- Guessing without reading errors
- Adding random fixes without understanding
- Hiding errors with try/catch
- Modifying unrelated code
- Claiming a fix without verification

## Verification Checklist
- [ ] Issue reproduced
- [ ] Root cause identified
- [ ] Fix addresses root cause
- [ ] Tests pass after fix
- [ ] No regressions introduced
