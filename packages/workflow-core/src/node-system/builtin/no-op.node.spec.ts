import { NoOpNodeHandler } from './no-op.node';
import { NodeExecutionContext } from '../interfaces';

describe('NoOpNodeHandler', () => {
  let handler: NoOpNodeHandler;
  let context: NodeExecutionContext;

  beforeEach(() => {
    handler = new NoOpNodeHandler();
    context = {
      workflowId: 'wf-1',
      executionId: 'exec-1',
      nodeId: 'n1',
      nodeResults: new Map(),
      startedAt: new Date(),
    };
  });

  it('should pass input through unchanged', async () => {
    const input = { key: 'value', nested: { a: 1 } };
    const result = await handler.execute(input, {}, context);
    expect(result.output).toBe(input);
  });

  it('should handle null input', async () => {
    const result = await handler.execute(null, {}, context);
    expect(result.output).toBeNull();
  });
});
