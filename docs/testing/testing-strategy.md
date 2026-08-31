# Testing Strategy

## Status: Established

## Testing Layers

### Unit Tests

- **Location**: Co-located with source files (`*.spec.ts`)
- **Scope**: Service methods, utilities, pure functions
- **Framework**: Jest
- **Command**: `pnpm test`

### Integration Tests

- **Location**: Co-located or in `test/` directory
- **Scope**: Module interactions, API endpoints
- **Framework**: Jest + NestJS TestingModule
- **Command**: `pnpm test`

### E2E Tests

- **Location**: `test/` directory (`*.e2e-spec.ts`)
- **Scope**: Full application flows
- **Framework**: Jest + Supertest
- **Command**: `pnpm test:e2e`

## Test Naming Convention

```typescript
describe('ServiceName', () => {
  it('should do expected behavior when condition', () => {
    // Arrange
    // Act
    // Assert
  });
});
```

## Test Organization

- Tests are co-located with the code they test.
- One test file per source file.
- Test file named `{source-file-name}.spec.ts`.

## Test Requirements

- Unit tests required for all business logic.
- Integration tests for API endpoints.
- Tests written during implementation, not only at end.
- Tests must be independent (no execution order dependency).
- Tests must cover happy path and error cases.

## Running Tests

```bash
# Unit tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:cov

# E2E tests
pnpm test:e2e

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

## Future Testing Layers (Planned)

- **Runtime tests**: Workflow execution verification
- **Compiler tests**: Code generation output verification
- **Security tests**: Authentication, authorization, input validation
- **Regression tests**: Ensuring fixed bugs stay fixed
