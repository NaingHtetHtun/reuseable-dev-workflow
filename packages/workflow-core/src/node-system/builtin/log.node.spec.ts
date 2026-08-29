import { LogNodeHandler } from './log.node';
import { NodeExecutionContext } from '../interfaces';

describe('LogNodeHandler', () => {
  let handler: LogNodeHandler;
  let context: NodeExecutionContext;

  beforeEach(() => {
    handler = new LogNodeHandler();
    context = {
      workflowId: 'wf-1',
      executionId: 'exec-1',
      nodeId: 'n1',
      nodeResults: new Map(),
      startedAt: new Date(),
    };
  });

  it('should log message and return output', async () => {
    const result = await handler.execute({ key: 'value' }, { message: 'Hello' }, context);

    expect(result.output).toEqual({
      logged: true,
      message: 'Hello',
      input: { key: 'value' },
    });
  });

  it('should handle missing message', async () => {
    const result = await handler.execute(null, {}, context);
    expect(result.output).toHaveProperty('message', 'No message');
  });
});
