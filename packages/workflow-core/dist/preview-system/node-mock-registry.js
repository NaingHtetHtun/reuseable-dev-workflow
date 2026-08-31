import { NodeRegistry } from '../node-system/registry';
import {
  logDefinition,
  LogNodeHandler,
  setVariableDefinition,
  SetVariableNodeHandler,
  noOpDefinition,
  NoOpNodeHandler,
  httpRequestDefinition,
  HttpRequestNodeHandler,
  delayDefinition,
  DelayNodeHandler,
} from '../node-system/builtin';
/**
 * Mock HTTP request handler for preview mode.
 * Returns a mock response instead of making real HTTP calls.
 */
class MockHttpRequestHandler {
  type = 'http-request';
  async execute(input, parameters, _context) {
    const url = parameters.url ?? 'https://example.com';
    const method = parameters.method ?? 'GET';
    return {
      output: {
        status: 200,
        statusText: 'OK (mock)',
        headers: { 'content-type': 'application/json' },
        body: {
          message: 'This is a mock response for preview mode',
          requestedUrl: url,
          requestedMethod: method,
          timestamp: new Date().toISOString(),
        },
      },
    };
  }
  validateConfiguration(_parameters) {
    return { valid: true, errors: [] };
  }
}
/**
 * Mock delay handler for preview mode.
 * Skips the delay and returns immediately.
 */
class MockDelayHandler {
  type = 'delay';
  async execute(_input, parameters, _context) {
    const duration = parameters.duration ?? 1000;
    return {
      output: {
        skipped: true,
        originalDuration: duration,
        message: `Delay of ${duration}ms skipped in preview mode`,
      },
    };
  }
  validateConfiguration(_parameters) {
    return { valid: true, errors: [] };
  }
}
/**
 * Creates a mock NodeRegistry for preview mode.
 * Mocks HTTP requests and delays to prevent side effects.
 */
export function createPreviewRegistry(options) {
  const registry = new NodeRegistry();
  // Register real handlers for safe nodes
  registry.register(logDefinition, new LogNodeHandler());
  registry.register(setVariableDefinition, new SetVariableNodeHandler());
  registry.register(noOpDefinition, new NoOpNodeHandler());
  // Register mock handlers for nodes with side effects
  if (!options?.executeHttp) {
    registry.register(httpRequestDefinition, new MockHttpRequestHandler());
  } else {
    registry.register(httpRequestDefinition, new HttpRequestNodeHandler());
  }
  if (!options?.executeDelays) {
    registry.register(delayDefinition, new MockDelayHandler());
  } else {
    registry.register(delayDefinition, new DelayNodeHandler());
  }
  return registry;
}
//# sourceMappingURL=node-mock-registry.js.map
