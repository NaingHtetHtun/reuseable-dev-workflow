# Workflow Engine Skill

## Purpose
Guide future workflow engine architecture (planned, not implemented).

## When to Use
- Designing the workflow runtime
- Adding new workflow node types
- Implementing workflow execution

## Status: PLANNED — Not Yet Implemented

## Future Architecture
```
Workflow Definition (JSON/YAML)
  → Workflow Runtime
    → Node Registry
      → Node Execution
        → Result / Output
```

## Principles
1. Workflow definitions are data, not code.
2. Nodes are pluggable and registered.
3. Runtime executes workflows safely.
4. Workflows are testable in isolation.
5. Workflow execution is idempotent where possible.

## Node Types (Future)
- Trigger nodes
- Action nodes
- Condition nodes
- Loop nodes
- Error handling nodes
- Integration nodes

## Things to Inspect (when implementing)
- Workflow definition format
- Node interface contracts
- Execution context and state
- Error handling patterns

## Things to Avoid
- Executing arbitrary code in workflows
- Tight coupling between nodes
- Missing error handling
- Unbounded execution loops
- State leaks between workflow runs

## Verification Checklist
- [ ] Workflow definition validated
- [ ] Nodes execute in correct order
- [ ] Error handling works
- [ ] Workflows are testable
- [ ] Execution is bounded
