import { HttpRequestNodeHandler } from './http-request.node';
// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;
describe('HttpRequestNodeHandler', () => {
  let handler;
  let context;
  beforeEach(() => {
    handler = new HttpRequestNodeHandler();
    context = {
      workflowId: 'wf-1',
      executionId: 'exec-1',
      nodeId: 'n1',
      nodeResults: new Map(),
      startedAt: new Date(),
    };
    mockFetch.mockReset();
  });
  it('should make GET request and return response', async () => {
    mockFetch.mockResolvedValueOnce({
      status: 200,
      headers: {
        get: (key) => (key === 'content-type' ? 'application/json' : null),
        forEach: (cb) => {
          cb('application/json', 'content-type');
        },
      },
      json: async () => ({ data: 'hello' }),
    });
    const result = await handler.execute(null, { url: 'https://api.example.com/data' }, context);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/data',
      expect.objectContaining({ method: 'GET' }),
    );
    expect(result.output).toEqual({
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: { data: 'hello' },
    });
  });
  it('should make POST request with body', async () => {
    mockFetch.mockResolvedValueOnce({
      status: 201,
      headers: {
        get: () => 'text/plain',
        forEach: (cb) => {
          cb('text/plain', 'content-type');
        },
      },
      text: async () => 'created',
    });
    await handler.execute(
      null,
      {
        url: 'https://api.example.com/data',
        method: 'POST',
        body: { name: 'test' },
      },
      context,
    );
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/data',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'test' }),
      }),
    );
  });
  describe('validate', () => {
    it('should accept valid URL', () => {
      const result = handler.validate({ url: 'https://example.com' });
      expect(result.valid).toBe(true);
    });
    it('should reject invalid URL', () => {
      const result = handler.validate({ url: 'not-a-url' });
      expect(result.valid).toBe(false);
    });
    it('should reject invalid HTTP method', () => {
      const result = handler.validate({
        url: 'https://example.com',
        method: 'INVALID',
      });
      expect(result.valid).toBe(false);
    });
  });
});
//# sourceMappingURL=http-request.node.spec.js.map
