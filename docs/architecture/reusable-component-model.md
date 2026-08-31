# Reusable Component Model

## Status: PLANNED — Not Yet Implemented

## Concept

The platform will eventually support reusable development components that can:

1. Run inside the platform
2. Be previewed inside the platform
3. Be tested inside the platform
4. Be exported into real standalone applications
5. Support multiple target frameworks

## Component Structure

Each reusable component should eventually contain:

```
component/
├── definition.md              # What it does, inputs, outputs
├── config.schema.json         # User-configurable options
├── credentials.schema.json    # What credentials it needs
├── runtime/                   # Platform execution implementation
│   └── index.ts
├── preview/                   # Preview behavior
│   └── index.ts
├── tests/                     # Unit and integration tests
│   ├── unit.test.ts
│   └── integration.test.ts
├── generators/                # Framework-specific code generation
│   ├── laravel/
│   │   └── index.ts
│   ├── nestjs/
│   │   └── index.ts
│   └── other-frameworks/
│       └── index.ts
└── README.md
```

## Example Components (Future)

| Component           | Description                   | Status  |
| ------------------- | ----------------------------- | ------- |
| Google Login        | Google OAuth2 authentication  | PLANNED |
| Apple Login         | Apple Sign In                 | PLANNED |
| Email Login         | Email/password authentication | PLANNED |
| User CRUD           | User management with roles    | PLANNED |
| Category CRUD       | Generic category management   | PLANNED |
| File Upload         | File upload with storage      | PLANNED |
| Email Sending       | Transactional email           | PLANNED |
| Notifications       | Push/email/SMS notifications  | PLANNED |
| Roles & Permissions | RBAC system                   | PLANNED |

## Key Principle

The same logical component should be capable of:

- Running as a workflow node in the platform
- Being previewed with sample data
- Being tested with unit and integration tests
- Generating valid Laravel code
- Generating valid NestJS code
- Supporting future frameworks

Runtime and code generation are separate implementations of the same concept.
