import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DelayNodeHandler } from './delay.node';
import { NodeExecutionContext } from '../interfaces';

describe('DelayNodeHandler', () => {
  let handler: DelayNodeHandler;
  let context: NodeExecutionContext;

  beforeEach(() => {
    handler = new DelayNodeHandler();
    context = {
      workflowId: 'wf-1',
      executionId: 'exec-1',
      nodeId: 'n1',
      nodeResults: new Map(),
      startedAt: new Date(),
    };
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should wait for specified duration', async () => {
    const input = { key: 'value' };
    const promise = handler.execute(input, { duration: 1000 }, context);

    // Advance timers
    vi.advanceTimersByTime(1000);

    const result = await promise;
    expect(result.output).toBe(input);
  });

  it('should handle zero duration', async () => {
    const promise = handler.execute(null, { duration: 0 }, context);
    vi.advanceTimersByTime(0);
    const result = await promise;
    expect(result.output).toBeNull();
  });
});
