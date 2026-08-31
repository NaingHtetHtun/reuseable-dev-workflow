# Definition of Done

## Status: Established

A feature is DONE when ALL of the following are true:

## Planning

- [ ] Feature plan created in `docs/features/`
- [ ] Plan reviewed and approved by human

## Implementation

- [ ] Implementation matches approved scope exactly
- [ ] No scope creep or unrelated improvements
- [ ] No silent architectural decisions

## Testing

- [ ] Unit tests written and passing
- [ ] Integration tests written and passing (if applicable)
- [ ] `pnpm test` passes
- [ ] `pnpm test:e2e` passes (if applicable)

## Quality

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm format` passes
- [ ] No dead code
- [ ] No unnecessary dependencies
- [ ] No duplicated logic
- [ ] Files are reasonably sized
- [ ] Single responsibility maintained

## Security

- [ ] No hard-coded secrets
- [ ] Input validated
- [ ] No sensitive data in logs

## Documentation

- [ ] Feature documentation created/updated
- [ ] Status is accurate
- [ ] Changes documented

## Preview

- [ ] Preview provided for human review
- [ ] Human reviewed and accepted

## Final

- [ ] No unrelated files modified
- [ ] Git commit is logically isolated
- [ ] Commit message is clear and descriptive
