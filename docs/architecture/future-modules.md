# Future Modules

## Status: PLANNED — Not Yet Implemented

This document describes the planned module architecture for the DevFlow Platform.

## Current Modules

| Module | Status | Description |
|--------|--------|-------------|
| App | Implemented | Health endpoint, root module |

## Planned Modules

### Projects Module
- Project CRUD management
- Project configuration
- Project scoping for workflows and components

### Workflows Module
- Workflow definition management
- Workflow versioning
- Workflow configuration

### Nodes Module
- Node type registry
- Node definition management
- Node configuration schemas

### Credentials Module
- Credential storage (encrypted)
- Credential validation
- Credential lifecycle management

### Runtime Module
- Workflow execution engine
- Node execution orchestration
- Execution state management
- Error handling and retry

### Compiler Module
- Application definition parsing
- Framework adapter selection
- Code generation orchestration
- Template rendering

### Preview Module
- Live preview generation
- Sandbox execution
- Preview state management

## Module Dependencies (Future)

```
Projects → Workflows → Nodes
                    → Credentials
                    → Runtime
                    → Compiler → Preview
```

Dependencies should flow downward. No circular dependencies.

## Implementation Order (Recommended)

1. Projects Module
2. Workflows Module
3. Nodes Module
4. Credentials Module
5. Runtime Module
6. Compiler Module
7. Preview Module
