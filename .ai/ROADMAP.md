# DevFlow Platform — Development Roadmap

> **Purpose**: Long-term product direction. A completely fresh AI session should read this file to understand where the project is going without relying on conversation history.
>
> **Rule**: Never mark a phase COMPLETED unless its completion criteria have actually been verified against the repository and tests.
>
> **Last updated**: 2026-08-29

---

## Phase 0 — Development System

**Status**: ✅ COMPLETED

**Goal**: Establish a strong, maintainable, AI-assisted development system before writing any application code.

**Why it exists**: Without development conventions, skills, prompts, and rules, AI agents will make inconsistent decisions and produce unmaintainable code.

**Major features**:
- AGENTS.md development contract
- `.ai/skills/` engineering discipline skills (18 skills)
- `.ai/prompts/` workflow prompt templates (6 templates)
- Documentation system (`docs/`)
- Feature documentation templates
- Architecture principles and decisions
- Testing strategy
- Dependency policy
- Session continuity system (`docs/state/`)
- AI roadmap (this file)

**Dependencies**: None.

**Expected deliverables**:
- `AGENTS.md` with complete development contract
- `.ai/skills/` directory with skill files
- `.ai/prompts/` directory with prompt templates
- `docs/` directory structure
- `docs/state/` session continuity files

**Testing requirements**: N/A (documentation only).

**Completion criteria**:
- [x] AGENTS.md exists and covers all required sections
- [x] Skills directory has files for all engineering disciplines
- [x] Prompt templates exist for all workflow types
- [x] Documentation structure is established
- [x] Session continuity system is operational

**Intentionally out of scope**:
- Application features
- Database setup
- Authentication
- Any code beyond a minimal skeleton

---

## Phase 1 — Platform Foundation

**Status**: ✅ COMPLETED

**Goal**: Build the minimum viable NestJS foundation that all future modules depend on.

**Why it exists**: Future modules (projects, workflows, nodes) need a shared infrastructure layer: database access, configuration, logging, error handling, API versioning, and health checks.

**Major features**:
- NestJS module structure (`src/modules/`, `src/shared/`, `src/config/`)
- Prisma ORM with PostgreSQL
- Configuration management (`@nestjs/config`)
- Global exception filter
- Request logging interceptor
- API versioning (URI-based: `/api/v1/...`)
- Health endpoint with database connectivity check
- Shared pagination DTO
- Database migration and seed scripts

**Dependencies**: Phase 0.

**Expected deliverables**:
- `prisma/schema.prisma` with base models
- `src/shared/database/` module
- `src/shared/filters/` exception filter
- `src/shared/interceptors/` logging interceptor
- `src/modules/health/` health check module
- `src/config/` configuration modules
- Working tests for all components

**Testing requirements**:
- Unit tests for health service and controller
- Unit tests for exception filter
- Typecheck and lint pass

**Completion criteria**:
- [x] Prisma schema exists and generates client
- [x] Database module is global and injectable
- [x] Configuration loads from environment
- [x] Exception filter returns consistent error JSON
- [x] Logging interceptor logs requests
- [x] Health endpoint checks database connectivity
- [x] API versioning works (`/api/v1/health`)
- [x] All tests pass
- [x] Typecheck passes
- [x] Lint passes

**Intentionally out of scope**:
- Projects module (Phase 2)
- Authentication
- Background workers
- Redis/cache
- Docker

---

## Phase 2 — Projects Module

**Status**: ✅ COMPLETED

**Goal**: CRUD for managing platform projects — the first domain module.

**Why it exists**: Everything in the platform (workflows, nodes, credentials) is scoped to a project. This module establishes the pattern for all future domain modules.

**Major features**:
- Project entity with Prisma model
- Create, read, update, delete projects
- List projects with pagination
- Project validation (name required, unique constraints)
- Project service with business logic
- Project controller with REST API
- Unit and integration tests

**Dependencies**: Phase 1.

**Expected deliverables**:
- `src/modules/projects/` module
- Prisma migration for projects table
- REST API endpoints
- Unit and integration tests
- Feature documentation

**Testing requirements**:
- Unit tests for project service
- Integration tests for project API endpoints
- Validation tests for invalid input**Completion criteria**:

- [x] Prisma schema has Project model with correct fields
- [x] CRUD endpoints work: POST, GET, PATCH, DELETE
- [x] Pagination works on list endpoint
- [x] Search works on list endpoint
- [x] Validation rejects invalid input
- [x] Unit tests pass (11 tests)
- [x] Integration tests pass (17 tests)
- [x] Feature documentation created

**Intentionally out of scope**:
- Authentication/authorization
- Project settings beyond name
- Project deletion cascade
- Soft deletion

---

## Phase 3 — Workflow Engine

**Status**: ✅ COMPLETED

**Goal**: Define, store, and execute workflows as directed graphs of nodes.

**Why it exists**: The core product value is visual workflow automation. Workflows are the primary abstraction developers will configure and execute.

**Major features**:
- Workflow entity (name, description, version, status)
- Workflow definition format (JSON-based directed graph)
- Workflow versioning
- Workflow validation (acyclic graph, valid node references)
- Workflow CRUD API
- Workflow execution runtime (basic sequential execution)
- Execution history and logging
- Error handling within workflows

**Dependencies**: Phase 2 (workflows are scoped to projects).

**Expected deliverables**:
- `src/modules/workflows/` module
- `src/modules/workflow-runtime/` execution engine
- Workflow definition schema
- REST API for workflow management
- Basic execution engine (sequential nodes)
- Execution history storage
- Feature documentation

**Testing requirements**:
- Unit tests for workflow validation
- Unit tests for execution engine
- Integration tests for workflow API
- Test workflows with multiple nodes
- Test error handling in workflows**Completion criteria**:

- [x] Workflow definition format is defined and documented
- [x] Workflow CRUD works
- [x] Workflow validation catches invalid definitions (8 rules)
- [x] Basic execution engine runs sequential workflows
- [x] Execution history is recorded
- [x] Error handling works within workflows
- [x] All tests pass (65 tests)

**Intentionally out of scope**:
- Visual workflow builder (UI)
- Parallel execution
- Conditional branching (basic version)
- Webhook triggers
- Scheduled execution

---

## Phase 4 — Node System

**Status**: ✅ COMPLETED

**Goal**: Pluggable node registry that workflows use to execute individual steps.

**Why it exists**: Nodes are the building blocks of workflows. A flexible node system allows adding new capabilities without modifying the workflow engine.

**Major features**:
- Node type registry
- Node definition schema (inputs, outputs, configuration)
- Base node interface
- Built-in node types (HTTP request, delay, log, set variable)
- Node configuration validation
- Node execution within workflow context
- Node input/output passing

**Dependencies**: Phase 3 (nodes execute within workflows).

**Expected deliverables**:
- `src/modules/nodes/` module
- Node registry service
- Base node interface/type definitions
- Built-in node implementations
- Node validation
- Node execution tests
- Feature documentation

**Testing requirements**:
- Unit tests for each built-in node type
- Unit tests for node registry
- Integration tests for node execution within workflows
- Test node input/output passing**Completion criteria**:

- [x] Node interface is defined (framework-independent)
- [x] Node registry allows registration and lookup
- [x] 5 built-in nodes work (log, set-variable, no-op, http-request, delay)
- [x] Node configuration is validated (schema + custom)
- [x] Nodes execute within workflow context
- [x] Input/output passes between nodes correctly
- [x] All tests pass (96 tests)

**Intentionally out of scope**:
- Custom node creation UI
- Node marketplace
- Community nodes
- Node versioning

---

## Phase 5 — Credentials / Integrations

**Status**: ✅ COMPLETED

**Feature plan**: `docs/features/006-credentials-integrations.md`

**Goal**: Secure storage and management of credentials for external service integrations.

**Why it exists**: Workflows need to connect to external services (Google, GitHub, email providers). Credentials must be stored securely and referenced by nodes.

**Major features**:
- Credential entity (encrypted storage)
- Credential types/schema (per integration)
- Credential validation
- Credential CRUD API (create, read, update, delete — no read-back of secrets)
- Encryption at rest
- Credential reference in workflow nodes
- Integration registry (which credentials each integration needs)

**Dependencies**: Phase 4 (nodes reference credentials).

**Expected deliverables**:
- `src/modules/credentials/` module
- `src/modules/integrations/` registry
- Encryption service
- Credential CRUD API
- Integration type definitions
- Feature documentation

**Testing requirements**:
- Unit tests for encryption/decryption
- Unit tests for credential validation
- Integration tests for credential API
- Test that secrets are not exposed in API responses
- Test credential reference in nodes

**Completion criteria**:
- [x] Credentials are encrypted at rest
- [x] Secret values are never returned in API responses
- [x] Credential validation works per integration type
- [x] Credentials can be referenced by workflow nodes
- [x] Integration registry defines required credentials
- [x] All tests pass (162 total)

**Intentionally out of scope**:
- OAuth2 flow implementation (specific integrations)
- Credential rotation
- Credential sharing between projects
- Audit logging

---

## Phase 6 — Reusable Component System

**Status**: NOT STARTED

**Goal**: Framework for defining, storing, and managing reusable development components.

**Why it exists**: The core product vision is building components once and reusing them. This phase establishes the architecture for component definitions.

**Major features**:
- Component definition format (schema, config, credentials, tests)
- Component registry
- Component configuration schema
- Component versioning
- Component metadata (description, author, tags)
- Component search and filtering

**Dependencies**: Phase 5 (components reference credentials).

**Expected deliverables**:
- `src/modules/components/` module
- Component definition schema
- Component registry service
- REST API for component management
- Feature documentation

**Testing requirements**:
- Unit tests for component validation
- Integration tests for component API
- Test component versioning

**Completion criteria**:
- [ ] Component definition format is defined
- [ ] Component CRUD works
- [ ] Component versioning works
- [ ] Component search works
- [ ] All tests pass

**Intentionally out of scope**:
- Component execution
- Component preview
- Component code generation
- Component marketplace UI

---

## Phase 7 — OAuth / Authentication Integrations

**Status**: ✅ COMPLETED

**Feature plan**: `docs/features/007-oauth-integrations.md`

**Goal**: Establish a reusable, framework-independent OAuth integration architecture supporting multiple providers.

**Why it exists**: The platform needs to support OAuth2 authorization flows for external services. This phase creates the abstraction that Google, Apple, GitHub, and Microsoft providers will implement.

**Major features**:
- OAuth provider abstraction (framework-independent interface)
- OAuth provider registry
- Google OAuth provider (authorization code flow)
- Authorization URL generation
- Callback handling and code exchange
- State parameter / CSRF protection
- Token lifecycle (exchange, refresh, expiration)
- Credential integration (stores tokens via Phase 5)
- OAuth scopes and provider metadata
- API endpoints for OAuth flows
- Node integration for OAuth-aware nodes

**Dependencies**: Phase 5 (credentials), Phase 4 (nodes).

**Expected deliverables**:
- `packages/workflow-core/src/oauth-system/` — Framework-independent OAuth system
- `apps/api/src/modules/oauth/` — NestJS OAuth module
- Google OAuth provider implementation
- API endpoints for authorization and callback
- Feature documentation

**Testing requirements**:
- Unit tests for OAuth provider logic
- Unit tests for state management
- Unit tests for token manager
- Integration tests for API OAuth flow
- Test CSRF protection

**Completion criteria**:
- [x] OAuthProvider interface defined
- [x] GoogleOAuthProvider implemented (with PKCE)
- [x] State parameter CSRF protection works
- [x] Token exchange works with mock provider
- [x] Token refresh works correctly
- [x] Credentials stored after OAuth flow
- [x] API endpoints work
- [x] All tests pass (221 total)

**Intentionally out of scope**:
- Complete Google Login feature (UI, session management)
- Apple/GitHub/Microsoft OAuth implementations
- Laravel/NestJS generators
- Visual workflow builder
- OpenID Connect
- PKCE flow

---

## Phase 8 — Resource / CRUD Builder

**Status**: NOT STARTED

**Goal**: Define resources visually and generate CRUD operations from definitions.

**Why it exists**: Developers repeatedly build CRUD for entities. A structured definition should generate database schema, validation, API, and UI.

**Major features**:
- Resource definition format (name, fields, types, constraints)
- Field type system (string, text, boolean, number, timestamp, relation)
- Validation rule generation from field definitions
- CRUD API generation from resource definition
- Database migration generation
- Resource preview

**Dependencies**: Phase 6 (resources are a type of reusable component).

**Expected deliverables**:
- Resource definition schema
- Validation generator
- CRUD API generator
- Migration generator
- Feature documentation

**Testing requirements**:
- Unit tests for resource definition validation
- Unit tests for each generator
- Integration tests for generated CRUD API
- Test generated migrations

**Completion criteria**:
- [ ] Resource definition format is defined
- [ ] Validation rules generate correctly
- [ ] CRUD endpoints generate correctly
- [ ] Migrations generate correctly
- [ ] Generated code passes typecheck
- [ ] All tests pass

**Intentionally out of scope**:
- Visual resource editor (UI)
- UI generation
- Relationship handling (beyond basic foreign keys)
- Custom field types

---

## Phase 9 — Preview System

**Status**: NOT STARTED

**Goal**: Allow developers to visually or practically verify features before deploying.

**Why it exists**: Developers need to see what they're building. Preview reduces the feedback loop.

**Major features**:
- Preview sandbox (isolated execution)
- Workflow preview (execute with test data)
- Component preview (show component behavior)
- API preview (Swagger/OpenAPI)
- Preview state management
- Preview URL generation

**Dependencies**: Phase 3 (workflow preview), Phase 6 (component preview).

**Expected deliverables**:
- Preview module
- Swagger/OpenAPI integration
- Preview sandbox
- Feature documentation

**Testing requirements**:
- Unit tests for preview generation
- Integration tests for preview execution
- Test sandbox isolation

**Completion criteria**:
- [ ] Swagger/OpenAPI available at `/api/docs`
- [ ] Workflow preview works with test data
- [ ] Component preview shows behavior
- [ ] Preview sandbox is isolated
- [ ] All tests pass

**Intentionally out of scope**:
- Live UI preview
- Hot reload preview
- Preview deployment
- Preview sharing

---

## Phase 10 — Code Generation Engine

**Status**: NOT STARTED

**Goal**: Generate real application code from platform definitions.

**Why it exists**: The ultimate value is producing working code. Definitions in the platform should export to real frameworks.

**Major features**:
- Internal application definition format (framework-independent)
- Compiler pipeline (definition → framework code)
- Template engine
- AST manipulation (where needed)
- Generated project structure
- Generated code validation (typecheck/lint)

**Dependencies**: Phase 6 (component definitions), Phase 8 (resource definitions).

**Expected deliverables**:
- `src/modules/compiler/` module
- Internal definition format
- Template engine
- Compiler pipeline
- Feature documentation

**Testing requirements**:
- Unit tests for template rendering
- Unit tests for compiler pipeline
- Integration tests for code generation
- Generated code must pass typecheck

**Completion criteria**:
- [ ] Internal definition format is defined
- [ ] Compiler pipeline works end-to-end
- [ ] Templates render correctly
- [ ] Generated code passes typecheck
- [ ] All tests pass

**Intentionally out of scope**:
- Framework-specific generators (Phase 11-12)
- Visual code preview
- Code diff preview
- Incremental generation

---

## Phase 11 — Laravel Generator

**Status**: NOT STARTED

**Goal**: Generate Laravel projects from platform definitions.

**Why it exists**: Laravel is a primary target framework. Developers should be able to export their platform definitions to a working Laravel project.

**Major features**:
- Laravel project template
- Model generation from resource definitions
- Migration generation
- Controller generation
- Route generation
- Validation generation
- Laravel v12 adapter

**Dependencies**: Phase 10.

**Expected deliverables**:
- Laravel generator module
- Laravel templates
- Laravel v12 adapter
- Generated project validation
- Feature documentation

**Testing requirements**:
- Unit tests for Laravel templates
- Integration tests for project generation
- Generated Laravel project must pass `php artisan`
- All tests pass

**Completion criteria**:
- [ ] Laravel project generates from definitions
- [ ] Models generate correctly
- [ ] Migrations generate correctly
- [ ] Controllers generate correctly
- [ ] Generated project passes Laravel validation
- [ ] All tests pass

**Intentionally out of scope**:
- Laravel v13+ (future adapters)
- Blade templates
- Livewire components
- Nova admin panels

---

## Phase 12 — NestJS Generator

**Status**: NOT STARTED

**Goal**: Generate NestJS projects from platform definitions.

**Why it exists**: NestJS is the platform's own framework. Generating NestJS projects validates the architecture and provides a reference implementation.

**Major features**:
- NestJS project template
- Module generation from resource definitions
- Controller generation
- Service generation
- DTO generation
- Prisma schema generation
- NestJS v10 adapter

**Dependencies**: Phase 10.

**Expected deliverables**:
- NestJS generator module
- NestJS templates
- NestJS v10 adapter
- Generated project validation
- Feature documentation

**Testing requirements**:
- Unit tests for NestJS templates
- Integration tests for project generation
- Generated NestJS project must pass `pnpm typecheck`
- All tests pass

**Completion criteria**:
- [ ] NestJS project generates from definitions
- [ ] Modules generate correctly
- [ ] Controllers generate correctly
- [ ] Services generate correctly
- [ ] DTOs generate correctly
- [ ] Generated project passes typecheck
- [ ] All tests pass

**Intentionally out of scope**:
- NestJS v11+ (future adapters)
- GraphQL generation
- Microservice generation
- WebSocket generation

---

## Phase 13 — AI Integration

**Status**: NOT STARTED

**Goal**: Integrate AI capabilities into the platform for assisted development.

**Why it exists**: AI should help with project-specific business logic while the platform handles reusable foundations.

**Major features**:
- AI-assisted workflow design
- AI-assisted component configuration
- AI code suggestions
- AI documentation generation
- AI testing assistance

**Dependencies**: Phases 3-12 (AI assists with existing features).

**Expected deliverables**:
- AI integration module
- AI prompt templates
- AI response formatting
- Feature documentation

**Testing requirements**:
- Unit tests for AI integration
- Integration tests for AI responses
- Test AI prompt templates

**Completion criteria**:
- [ ] AI integration module works
- [ ] AI can assist with workflow design
- [ ] AI can assist with component configuration
- [ ] AI responses are properly formatted
- [ ] All tests pass

**Intentionally out of scope**:
- Custom AI model training
- AI model hosting
- AI billing
- Multi-model support

---

## Phase 14 — Production Hardening

**Status**: NOT STARTED

**Goal**: Make the platform production-ready with security, performance, and operational features.

**Why it exists**: A platform that isn't production-ready can't be used by real teams.

**Major features**:
- Authentication and authorization
- Rate limiting
- Request validation hardening
- CORS configuration
- Security headers
- Database connection pooling
- Caching layer (Redis)
- Background job processing
- Monitoring and metrics
- Logging aggregation
- Health check enhancements
- Docker deployment
- CI/CD pipeline

**Dependencies**: All previous phases.

**Expected deliverables**:
- Authentication module
- Authorization module
- Rate limiting
- Docker configuration
- CI/CD pipeline
- Monitoring setup
- Feature documentation

**Testing requirements**:
- Security tests
- Load tests
- Integration tests for auth flows
- All existing tests continue to pass

**Completion criteria**:
- [ ] Authentication works end-to-end
- [ ] Authorization works end-to-end
- [ ] Rate limiting is configured
- [ ] Security headers are set
- [ ] Docker deployment works
- [ ] CI/CD pipeline runs
- [ ] All tests pass
- [ ] Load tests pass

**Intentionally out of scope**:
- Multi-tenancy
- White-label deployment
- Enterprise SSO
- Compliance certifications

---

## Monorepo Migration

**Status**: ✅ COMPLETED

**Purpose**: Convert the current single-package repository into a pnpm workspaces + Turborepo monorepo.

**Target structure**:
```
apps/
  api/        # NestJS backend (48 tests)
  web/        # React frontend (scaffold)
packages/
  workflow-core/  # Framework-independent workflow/node logic (65 tests)
```

**Feature plan**: `docs/features/005-monorepo-migration.md`

**Completion criteria**:
- [x] pnpm-workspace.yaml configured
- [x] turbo.json configured
- [x] Root package.json updated
- [x] API code moved to apps/api/
- [x] workflow-core extracted as separate package
- [x] React frontend scaffolded with Vite
- [x] All import paths updated
- [x] All tests pass (113 total)
- [x] Typecheck passes
- [x] Lint passes

---

## Phase Dependency Graph

```
Phase 0 (Dev System)
  └→ Phase 1 (Foundation)
       └→ Phase 2 (Projects)
            └→ Phase 3 (Workflows)
                 ├→ Phase 4 (Nodes)
                 │    └→ Phase 5 (Credentials)
                 │         └→ Phase 6 (Components)
                 │              ├→ Phase 7 (Google Login)
                 │              ├→ Phase 8 (CRUD Builder)
                 │              └→ Phase 10 (Code Gen)
                 │                   ├→ Phase 11 (Laravel)
                 │                   └→ Phase 12 (NestJS)
                 └→ Phase 9 (Preview)

Phase 13 (AI) — depends on Phases 3-12
Phase 14 (Production) — depends on all phases

Monorepo Migration — after Phase 4, before Phase 5
```

---

## How to Use This Roadmap

1. **At session start**: Read this file to understand the big picture.
2. **When starting a phase**: Read the phase's goals and deliverables.
3. **When completing a phase**: Verify completion criteria against the repository.
4. **When planning**: Use the dependency graph to determine what's next.
5. **When documenting**: Reference this roadmap for phase context.

## Update Rules

- Update this roadmap when major architectural decisions change.
- Update phase status when completion criteria are verified.
- Never mark a phase COMPLETED without verification.
- Add notes when phases are modified or reprioritized.
