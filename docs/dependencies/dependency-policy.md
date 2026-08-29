# Dependency Policy

## Status: Established

## Policy

Before installing any new dependency, the following steps are required:

### 1. Justify the Need
- Explain what capability is needed.
- Explain why existing solutions are insufficient.

### 2. Search Existing Project
- Check `package.json` for existing dependencies.
- Search codebase for existing implementations.

### 3. Research Official Documentation
- Find the official documentation.
- Verify the current stable version.
- Check installation instructions.

### 4. Verify Compatibility
- Compatible with current TypeScript version.
- Compatible with current Node.js version.
- No conflicts with existing dependencies.

### 5. Check Security and License
- No known security vulnerabilities.
- License is compatible with project.

### 6. Document
- Add rationale to the feature plan.
- Record version and documentation reference.

### 7. Await Approval
- If the dependency materially affects architecture or dependency footprint, wait for human approval.
- Minor dev dependencies (linters, formatters) can proceed with caution.

## Current Dependencies

### Runtime
| Package | Version | Purpose |
|---------|---------|---------|
| @nestjs/common | ^10.4.0 | NestJS core utilities |
| @nestjs/config | ^3.3.0 | Configuration management |
| @nestjs/core | ^10.4.0 | NestJS framework core |
| @nestjs/platform-express | ^10.4.0 | Express adapter |
| @prisma/client | ^6.19.3 | Prisma database client |
| class-transformer | ^0.5.1 | Data transformation |
| class-validator | ^0.14.1 | Input validation |
| reflect-metadata | ^0.2.2 | Decorator metadata |
| rxjs | ^7.8.1 | Reactive programming |

### Development
| Package | Version | Purpose |
|---------|---------|---------|
| @nestjs/cli | ^10.4.0 | NestJS CLI |
| @nestjs/schematics | ^10.1.0 | NestJS code generation |
| @nestjs/testing | ^10.4.0 | Testing utilities |
| jest | ^29.7.0 | Test framework |
| prisma | ^6.19.3 | Prisma CLI and migrations |
| @types/supertest | ^7.2.1 | Supertest type definitions |
| typescript | ^5.5.0 | TypeScript compiler |
| eslint | ^8.57.0 | Linting |
| prettier | ^3.3.0 | Formatting |

## Rules

- Do not install packages simply because they are convenient.
- Prefer existing project dependencies when appropriate.
- Never install packages without documentation research.
- Record all dependency decisions in feature documentation.
