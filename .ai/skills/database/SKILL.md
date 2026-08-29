# Database Skill

## Purpose
Follow database conventions for migrations, naming, and schema design.

## When to Use
- Creating database migrations
- Defining entity schemas
- Designing indexes and constraints
- Writing database queries

## Required Behavior (when database is added)
1. Use migrations for all schema changes — no manual DB changes.
2. IDs: use UUIDs by default, auto-increment for internal references.
3. Timestamps: always include `created_at` and `updated_at`.
4. Soft deletion: use `deleted_at` where data retention matters.
5. Foreign keys: always define explicit foreign key constraints.
6. Indexes: add indexes for frequently queried columns.
7. Unique constraints: enforce at database level, not just application.
8. Naming: snake_case for columns/tables, PascalCase for entities.

## Things to Inspect
- Existing migration patterns
- Existing entity definitions
- Query patterns in services

## Things to Avoid
- Raw SQL in controllers
- N+1 query patterns
- Missing indexes on foreign keys
- Database-specific logic in domain code
- Selecting `*` in production queries

## Verification Checklist
- [ ] Migration is reversible
- [ ] Indexes added for query patterns
- [ ] Foreign keys defined
- [ ] Timestamps included
- [ ] No raw SQL in controllers
