# Resource / CRUD Builder Concept

## Status: PLANNED — Not Yet Implemented

## Concept

A developer should be able to visually define a resource, and the platform should use that definition to support multiple outputs.

## Example: Category Resource

```yaml
name: Category
fields:
  - name: string
  - title: string, unique
  - description: text, nullable
  - active: boolean
  - created_at: timestamp
  - updated_at: timestamp
```

## Outputs from This Definition

| Output           | Description                                           |
| ---------------- | ----------------------------------------------------- |
| Database Schema  | Migration with correct types, constraints, indexes    |
| Validation Rules | Input validation for create/update                    |
| Model/Entity     | ORM entity or model class                             |
| CRUD API         | REST endpoints for list, create, read, update, delete |
| UI Preview       | Form and list views                                   |
| Generated Code   | Laravel, NestJS, or other framework code              |

## Key Principle

The structured definition is the single source of truth. All outputs derive from it, ensuring consistency.

## Definition Format (Future)

The resource definition should capture:

- Resource name
- Fields with types and constraints
- Relationships to other resources
- Validation rules
- Authorization rules
- UI preferences
- API configuration
- Framework-specific overrides

## What NOT to Do

- Do not implement this now.
- Do not create a visual editor yet.
- Do not build a definition parser yet.
- Only document the architectural requirement.
