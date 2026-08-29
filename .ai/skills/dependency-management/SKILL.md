# Dependency Management Skill

## Purpose
Manage dependencies responsibly and avoid unnecessary additions.

## When to Use
- Evaluating a new dependency
- Reviewing package.json changes
- Upgrading dependencies

## Required Behavior
1. Search existing project for equivalent capability first.
2. Research official documentation.
3. Verify compatibility with current project versions.
4. Check security advisories.
5. Check license compatibility.
6. Include dependency rationale in feature plan.
7. Wait for human approval if it materially affects architecture.

## Things to Inspect
- `package.json` for existing dependencies
- npm/pnpm lockfile for version details
- Official package documentation
- Package security advisories
- Bundle size impact

## Things to Avoid
- Installing packages for convenience
- Adding packages without documentation research
- Using deprecated packages
- Ignoring security vulnerabilities
- Adding multiple packages for the same purpose

## Verification Checklist
- [ ] Existing alternatives considered
- [ ] Official docs reviewed
- [ ] Version compatibility verified
- [ ] Security checked
- [ ] License compatible
- [ ] Rationale documented
- [ ] Human approved (if material)
