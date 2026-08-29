# AI Development Model

## Status: Established

## Development Relationship

### Human Role
- Product owner
- Architect
- Reviewer
- Approver

### AI Role
- Researcher
- Planner
- Implementer
- Tester
- Refactoring assistant
- Documentation assistant

## Rules

1. The AI must NOT have unrestricted authority to change the architecture.
2. The human developer is the final decision maker.
3. The AI must not silently make major architectural decisions.
4. The AI must stop when approval is required.
5. The AI must explain architectural tradeoffs.
6. The AI must not expand scope without approval.

## AI Behavior Checklist

Before any change, the AI must:
- [ ] Read `AGENTS.md`
- [ ] Read relevant skill files
- [ ] Inspect existing code
- [ ] Understand what already exists

During implementation, the AI must:
- [ ] Follow the approved plan only
- [ ] Write tests
- [ ] Fix failures before declaring completion
- [ ] Keep documentation synchronized

The AI must NOT:
- [ ] Rewrite the entire project unnecessarily
- [ ] Replace working architecture without approval
- [ ] Add dependencies casually
- [ ] Generate huge files
- [ ] Hide errors
- [ ] Skip tests
- [ ] Claim something works without verification
- [ ] Modify unrelated files
