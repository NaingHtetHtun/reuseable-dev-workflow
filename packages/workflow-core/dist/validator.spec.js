import { validateWorkflowDefinition } from './validator';
describe('WorkflowValidator', () => {
    const validDefinition = {
        nodes: [{ id: 'n1', type: 'log', name: 'Log 1', parameters: { message: 'hi' } }],
        edges: [],
    };
    const multiNodeDefinition = {
        nodes: [
            { id: 'n1', type: 'log', name: 'Log 1', parameters: { message: 'a' } },
            { id: 'n2', type: 'log', name: 'Log 2', parameters: { message: 'b' } },
        ],
        edges: [{ id: 'e1', source: 'n1', target: 'n2' }],
    };
    it('should accept a valid single-node workflow', () => {
        const result = validateWorkflowDefinition(validDefinition);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });
    it('should accept a valid multi-node workflow', () => {
        const result = validateWorkflowDefinition(multiNodeDefinition);
        expect(result.valid).toBe(true);
    });
    it('should reject empty node list', () => {
        const result = validateWorkflowDefinition({ nodes: [], edges: [] });
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain('at least one node');
    });
    it('should reject duplicate node IDs', () => {
        const definition = {
            nodes: [
                { id: 'n1', type: 'log', name: 'A', parameters: {} },
                { id: 'n1', type: 'log', name: 'B', parameters: {} },
            ],
            edges: [],
        };
        const result = validateWorkflowDefinition(definition);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes('Duplicate node ID'))).toBe(true);
    });
    it('should reject duplicate edge IDs', () => {
        const definition = {
            nodes: [
                { id: 'n1', type: 'log', name: 'A', parameters: {} },
                { id: 'n2', type: 'log', name: 'B', parameters: {} },
            ],
            edges: [
                { id: 'e1', source: 'n1', target: 'n2' },
                { id: 'e1', source: 'n2', target: 'n1' },
            ],
        };
        const result = validateWorkflowDefinition(definition);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes('Duplicate edge ID'))).toBe(true);
    });
    it('should reject edges referencing non-existent nodes', () => {
        const definition = {
            nodes: [{ id: 'n1', type: 'log', name: 'A', parameters: {} }],
            edges: [{ id: 'e1', source: 'n1', target: 'nonexistent' }],
        };
        const result = validateWorkflowDefinition(definition);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes('non-existent target'))).toBe(true);
    });
    it('should reject self-loops', () => {
        const definition = {
            nodes: [{ id: 'n1', type: 'log', name: 'A', parameters: {} }],
            edges: [{ id: 'e1', source: 'n1', target: 'n1' }],
        };
        const result = validateWorkflowDefinition(definition);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes('self-loop'))).toBe(true);
    });
    it('should reject cyclic graphs', () => {
        const definition = {
            nodes: [
                { id: 'n1', type: 'log', name: 'A', parameters: {} },
                { id: 'n2', type: 'log', name: 'B', parameters: {} },
                { id: 'n3', type: 'log', name: 'C', parameters: {} },
            ],
            edges: [
                { id: 'e1', source: 'n1', target: 'n2' },
                { id: 'e2', source: 'n2', target: 'n3' },
                { id: 'e3', source: 'n3', target: 'n1' },
            ],
        };
        const result = validateWorkflowDefinition(definition);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes('cycle'))).toBe(true);
    });
    it('should reject multiple start nodes', () => {
        const definition = {
            nodes: [
                { id: 'n1', type: 'log', name: 'A', parameters: {} },
                { id: 'n2', type: 'log', name: 'B', parameters: {} },
            ],
            edges: [],
        };
        const result = validateWorkflowDefinition(definition);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes('multiple start'))).toBe(true);
    });
    it('should reject no start node (all nodes have incoming edges)', () => {
        const definition = {
            nodes: [
                { id: 'n1', type: 'log', name: 'A', parameters: {} },
                { id: 'n2', type: 'log', name: 'B', parameters: {} },
            ],
            edges: [
                { id: 'e1', source: 'n1', target: 'n2' },
                { id: 'e2', source: 'n2', target: 'n1' },
            ],
        };
        const result = validateWorkflowDefinition(definition);
        expect(result.valid).toBe(false);
        // Should have cycle error AND no start node error
        expect(result.errors.length).toBeGreaterThanOrEqual(1);
    });
});
//# sourceMappingURL=validator.spec.js.map