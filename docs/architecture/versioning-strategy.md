# Versioning Strategy

## Status: PLANNED — Not Yet Implemented

## Concept

Framework-specific differences should be isolated in version adapters/strategies. The platform should not fork the entire framework project for every version.

## Example: Laravel

```
framework-adapters/
└── laravel/
    ├── v12/
    │   ├── adapter.ts          # Laravel v12 specific logic
    │   ├── templates/          # v12 templates
    │   └── differences.md      # What differs from other versions
    ├── v13/
    │   ├── adapter.ts
    │   ├── templates/
    │   └── differences.md
    └── shared/
        ├── base-adapter.ts     # Common adapter logic
        └── base-templates/     # Common templates
```

## Strategy

1. **Base adapter**: Contains logic common to all versions.
2. **Version adapter**: Contains version-specific overrides.
3. **Shared templates**: Templates that work across versions.
4. **Version templates**: Templates specific to one version.

## When to Add a Version

- When a new framework version introduces breaking changes.
- When generated code needs to differ between versions.
- When the framework's project structure changes.

## When NOT to Add a Version

- When changes are minor and don't affect generated code.
- When the base adapter handles the differences.
- When no users need the older version.
