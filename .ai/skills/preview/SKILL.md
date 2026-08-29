# Preview Skill

## Purpose
Provide practical ways for the human to inspect and verify features.

## When to Use
- After implementing a feature
- After fixing a bug
- When demonstrating a change

## Required Behavior
1. Always provide a way to verify the change.
2. Use the most practical verification method.
3. Include exact commands or URLs.

## Preview Methods
- **API endpoint**: curl command or request example
- **Local URL**: `http://localhost:3000/...`
- **Test command**: `pnpm test`
- **Typecheck**: `pnpm typecheck`
- **Example payload**: JSON request body
- **Swagger/OpenAPI**: when available

## Things to Inspect
- Application is running
- Endpoint responds correctly
- Response matches expected output

## Things to Avoid
- Claiming a feature works without showing how to verify
- Skipping preview when possible
- Vague preview instructions

## Verification Checklist
- [ ] Preview method provided
- [ ] Exact commands included
- [ ] Expected output described
