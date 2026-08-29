# Testing Skill

## Purpose
Write effective tests that verify behavior, not implementation details.

## When to Use
- Writing unit tests
- Writing integration tests
- Writing e2e tests
- Debugging failing tests

## Required Behavior
1. Tests must be close to implementation (co-located).
2. Test naming: `describe('ComponentName')` → `it('should do X when Y')`.
3. Test behavior, not implementation.
4. Use Arrange-Act-Assert pattern.
5. Mock external dependencies, not internal logic.
6. Run tests during implementation, not only at end.

## Testing Layers
- **Unit tests** (`.spec.ts`): Service methods, utilities, pure logic.
- **Integration tests** (`.e2e-spec.ts`): API endpoints, module interactions.
- **E2E tests** (`test/`): Full application flows.

## Things to Inspect
- Existing test patterns
- Existing mocks and fixtures
- Test configuration in `jest.config.ts`

## Things to Avoid
- Testing private methods directly
- Excessive mocking that hides bugs
- Tests that depend on execution order
- Skipped or pending tests without TODO
- Tests that pass but don't actually verify behavior

## Verification Checklist
- [ ] Tests cover happy path
- [ ] Tests cover error cases
- [ ] Tests are independent
- [ ] Tests use descriptive names
- [ ] `pnpm test` passes
