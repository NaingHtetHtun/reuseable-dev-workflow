import { describe, it, expect } from 'vitest';
import { createPreviewRegistry } from './node-mock-registry';

describe('createPreviewRegistry', () => {
  it('should create a registry with mock HTTP handler', () => {
    const registry = createPreviewRegistry();

    expect(registry.hasType('http-request')).toBe(true);
    expect(registry.hasType('delay')).toBe(true);
    expect(registry.hasType('log')).toBe(true);
    expect(registry.hasType('set-variable')).toBe(true);
    expect(registry.hasType('no-op')).toBe(true);
  });

  it('should mock HTTP requests by default', async () => {
    const registry = createPreviewRegistry();
    const handler = registry.getHandler('http-request');

    expect(handler).toBeDefined();

    const result = await handler!.execute(
      {},
      { url: 'https://api.example.com', method: 'GET' },
      {
        workflowId: 'test',
        executionId: 'test-1',
        nodeId: 'http-1',
        nodeResults: new Map(),
        startedAt: new Date(),
      },
    );

    expect(result.output).toBeDefined();
    const output = result.output as Record<string, unknown>;
    expect(output.statusText).toBe('OK (mock)');
    expect(output.body).toBeDefined();
  });

  it('should skip delays by default', async () => {
    const registry = createPreviewRegistry();
    const handler = registry.getHandler('delay');

    expect(handler).toBeDefined();

    const result = await handler!.execute(
      {},
      { duration: 5000 },
      {
        workflowId: 'test',
        executionId: 'test-1',
        nodeId: 'delay-1',
        nodeResults: new Map(),
        startedAt: new Date(),
      },
    );

    expect(result.output).toBeDefined();
    const output = result.output as Record<string, unknown>;
    expect(output.skipped).toBe(true);
    expect(output.originalDuration).toBe(5000);
  });

  it('should include real handlers for safe nodes', async () => {
    const registry = createPreviewRegistry();
    const logHandler = registry.getHandler('log');

    expect(logHandler).toBeDefined();

    const result = await logHandler!.execute(
      {},
      { message: 'Test log' },
      {
        workflowId: 'test',
        executionId: 'test-1',
        nodeId: 'log-1',
        nodeResults: new Map(),
        startedAt: new Date(),
      },
    );

    expect(result.output).toBeDefined();
  });

  it('should use real HTTP handler when executeHttp is true', () => {
    const registry = createPreviewRegistry({ executeHttp: true });

    expect(registry.hasType('http-request')).toBe(true);
    const handler = registry.getHandler('http-request');
    expect(handler).toBeDefined();
    expect(handler!.type).toBe('http-request');
  });

  it('should use real delay handler when executeDelays is true', () => {
    const registry = createPreviewRegistry({ executeDelays: true });

    expect(registry.hasType('delay')).toBe(true);
    const handler = registry.getHandler('delay');
    expect(handler).toBeDefined();
    expect(handler!.type).toBe('delay');
  });
});
