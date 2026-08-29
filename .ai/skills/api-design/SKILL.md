# API Design Skill

## Purpose
Design consistent, well-structured REST APIs.

## When to Use
- Creating new API endpoints
- Designing request/response formats
- Implementing pagination, filtering, or sorting
- Handling API errors

## Required Behavior
1. Use plural nouns for resources: `/projects`, not `/project`.
2. Use HTTP methods correctly: GET (read), POST (create), PATCH (update), DELETE (remove).
3. Validate all input with DTOs and class-validator.
4. Return consistent response format.
5. Use proper HTTP status codes.
6. Implement pagination for list endpoints.
7. Handle errors uniformly.
8. Version APIs when breaking changes are needed.

## Response Format Convention
```json
{
  "data": {},
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

## Things to Inspect
- Existing API patterns
- Existing DTO patterns
- Existing error handling

## Things to Avoid
- Inconsistent naming across endpoints
- Missing input validation
- Exposing internal IDs or structures
- Breaking API changes without versioning
- Returning raw database entities to clients

## Verification Checklist
- [ ] Input validated
- [ ] Proper HTTP status codes
- [ ] Consistent response format
- [ ] Pagination on list endpoints
- [ ] Error responses follow convention
