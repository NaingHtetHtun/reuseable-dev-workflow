# Security Skill

## Purpose
Enforce security best practices across the codebase.

## When to Use
- Handling secrets, credentials, or API keys
- Implementing authentication or authorization
- Processing user input
- Storing sensitive data
- Implementing API endpoints

## Required Behavior
1. Never hard-code secrets in source code.
2. Never commit real credentials (use `.env`).
3. Never print secrets in logs.
4. Validate all user input at API boundaries.
5. Use parameterized queries (when database is added).
6. Apply principle of least privilege.
7. Sanitize output to prevent XSS.
8. Use HTTPS in production.

## Things to Inspect
- `.env` and `.env.example` for secret management
- `.gitignore` excludes `.env` files
- Input validation on controllers
- No secrets in console.log statements
- No hardcoded API keys

## Things to Avoid
- Hard-coded credentials
- Logging sensitive data
- Skipping input validation
- Trusting client-side validation alone
- Exposing internal errors to clients

## Verification Checklist
- [ ] No secrets in source code
- [ ] `.env` excluded from git
- [ ] Input validated at API boundaries
- [ ] No sensitive data in logs
- [ ] Error responses don't leak internals
