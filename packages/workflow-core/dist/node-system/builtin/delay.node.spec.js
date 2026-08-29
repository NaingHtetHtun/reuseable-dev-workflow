import { DelayNodeHandler } from './delay.node';
describe('DelayNodeHandler', () => {
    let handler;
    let context;
    beforeEach(() => {
        handler = new DelayNodeHandler();
        context = {
            workflowId: 'wf-1',
            executionId: 'exec-1',
            nodeId: 'n1',
            nodeResults: new Map(),
            startedAt: new Date(),
        };
        jest.useFakeTimers();
    });
    afterEach(() => {
        jest.useRealTimers();
    });
    it('should wait for specified duration', async () => {
        const input = { key: 'value' };
        const promise = handler.execute(input, { duration: 1000 }, context);
        // Advance timers
        jest.advanceTimersByTime(1000);
        const result = await promise;
        expect(result.output).toBe(input);
    });
    it('should handle zero duration', async () => {
        const promise = handler.execute(null, { duration: 0 }, context);
        jest.advanceTimersByTime(0);
        const result = await promise;
        expect(result.output).toBeNull();
    });
});
//# sourceMappingURL=delay.node.spec.js.map