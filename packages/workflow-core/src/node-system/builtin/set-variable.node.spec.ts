import { SetVariableNodeHandler } from './set-variable.node';
import { NodeExecutionContext } from '../interfaces';

describe('SetVariableNodeHandler', () => {
  let handler: SetVariableNodeHandler;
  let context: NodeExecutionContext;

  beforeEach(() => {
    handler = new SetVariableNodeHandler();
    context = {
      workflowId: 'wf-1',
      executionId: 'exec-1',
      nodeId: 'n1',
      nodeResults: new Map(),
      startedAt: new Date(),
    };
  });

  it('should set variable on input', async () => {
    const result = await handler.execute({ existing: true }, { name: 'myVar', value: 42 }, context);

    expect(result.output).toEqual({ existing: true, myVar: 42 });
  });

  it('should handle empty input', async () => {
    const result = await handler.execute(null, { name: 'x', value: 'y' }, context);
    expect(result.output).toEqual({ x: 'y' });
  });
});
