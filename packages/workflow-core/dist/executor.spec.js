import { WorkflowExecutor } from './executor';
describe('WorkflowExecutor', () => {
    let executor;
    beforeEach(() => {
        executor = new WorkflowExecutor();
    });
    const singleNodeWorkflow = {
        nodes: [{ id: 'n1', type: 'log', name: 'Log', parameters: { message: 'Hello' } }],
        edges: [],
    };
    const multiNodeWorkflow = {
        nodes: [
            { id: 'n1', type: 'log', name: 'Step 1', parameters: { message: 'A' } },
            { id: 'n2', type: 'log', name: 'Step 2', parameters: { message: 'B' } },
            { id: 'n3', type: 'log', name: 'Step 3', parameters: { message: 'C' } },
        ],
        edges: [
            { id: 'e1', source: 'n1', target: 'n2' },
            { id: 'e2', source: 'n2', target: 'n3' },
        ],
    };
    describe('getRegistry', () => {
        it('should return the registry with built-in nodes', () => {
            const registry = executor.getRegistry();
            expect(registry.hasType('log')).toBe(true);
            expect(registry.hasType('set-variable')).toBe(true);
            expect(registry.hasType('no-op')).toBe(true);
            expect(registry.hasType('http-request')).toBe(true);
            expect(registry.hasType('delay')).toBe(true);
        });
    });
    describe('execute', () => {
        it('should execute a single-node workflow', async () => {
            const result = await executor.execute('wf-1', 'exec-1', singleNodeWorkflow, null);
            expect(result.status).toBe('completed');
            expect(result.error).toBeNull();
            expect(result.nodeResults).toHaveProperty('n1');
        });
        it('should execute a multi-node workflow sequentially', async () => {
            const result = await executor.execute('wf-1', 'exec-1', multiNodeWorkflow, null);
            expect(result.status).toBe('completed');
            expect(result.error).toBeNull();
            expect(result.nodeResults).toHaveProperty('n1');
            expect(result.nodeResults).toHaveProperty('n2');
            expect(result.nodeResults).toHaveProperty('n3');
        });
        it('should pass input to the first node', async () => {
            const input = { key: 'value' };
            const result = await executor.execute('wf-1', 'exec-1', singleNodeWorkflow, input);
            expect(result.status).toBe('completed');
            const nodeResult = result.nodeResults['n1'];
            expect(nodeResult.input).toEqual(input);
        });
        it('should handle set-variable node type', async () => {
            const definition = {
                nodes: [
                    {
                        id: 'n1',
                        type: 'set-variable',
                        name: 'Set Var',
                        parameters: { name: 'myVar', value: 42 },
                    },
                ],
                edges: [],
            };
            const result = await executor.execute('wf-1', 'exec-1', definition, null);
            expect(result.status).toBe('completed');
            expect(result.output).toEqual({ myVar: 42 });
        });
        it('should handle no-op node type', async () => {
            const definition = {
                nodes: [{ id: 'n1', type: 'no-op', name: 'No Op', parameters: {} }],
                edges: [],
            };
            const result = await executor.execute('wf-1', 'exec-1', definition, {
                test: true,
            });
            expect(result.status).toBe('completed');
            expect(result.output).toEqual({ test: true });
        });
        it('should fail on unknown node type', async () => {
            const definition = {
                nodes: [{ id: 'n1', type: 'unknown-type', name: 'Bad', parameters: {} }],
                edges: [],
            };
            const result = await executor.execute('wf-1', 'exec-1', definition, null);
            expect(result.status).toBe('failed');
            expect(result.error).toContain('Unknown node type');
        });
        it('should fail on invalid definition', async () => {
            const definition = { nodes: [], edges: [] };
            const result = await executor.execute('wf-1', 'exec-1', definition, null);
            expect(result.status).toBe('failed');
            expect(result.error).toContain('Invalid workflow definition');
        });
    });
});
//# sourceMappingURL=executor.spec.js.map