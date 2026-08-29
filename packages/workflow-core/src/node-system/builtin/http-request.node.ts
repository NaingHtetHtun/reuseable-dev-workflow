import {
  NodeTypeDefinition,
  NodeHandler,
  NodeExecutionContext,
  NodeExecutionResult,
  ValidationResult,
} from '../interfaces';

export const httpRequestDefinition: NodeTypeDefinition = {
  type: 'http-request',
  displayName: 'HTTP Request',
  description: 'Makes an HTTP request to a URL',
  category: 'integration',
  version: 1,
  parameterSchema: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'The URL to send the request to',
      },
      method: {
        type: 'string',
        description: 'HTTP method',
        default: 'GET',
        enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'],
      },
      headers: {
        type: 'object',
        description: 'Request headers',
      },
      body: {
        type: 'object',
        description: 'Request body (for POST/PUT/PATCH)',
      },
    },
    required: ['url'],
  },
  inputSchema: {
    type: 'object',
    properties: {},
  },
  outputSchema: {
    type: 'object',
    properties: {
      status: { type: 'number', description: 'HTTP status code' },
      headers: { type: 'object', description: 'Response headers' },
      body: { type: 'object', description: 'Response body' },
    },
  },
};

export class HttpRequestNodeHandler implements NodeHandler {
  readonly type = 'http-request';

  async execute(
    input: unknown,
    parameters: Record<string, unknown>,
    _context: NodeExecutionContext,
  ): Promise<NodeExecutionResult> {
    const url = parameters.url as string;
    const method = ((parameters.method as string) ?? 'GET').toUpperCase();
    const headers = (parameters.headers as Record<string, string>) ?? {};
    const body = parameters.body;

    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);

    let responseBody: unknown;
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      responseBody = await response.json();
    } else {
      responseBody = await response.text();
    }

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    return {
      output: {
        status: response.status,
        headers: responseHeaders,
        body: responseBody,
      },
    };
  }

  validate(parameters: Record<string, unknown>): ValidationResult {
    const errors: string[] = [];
    const url = parameters.url as string;

    if (!url) {
      errors.push('URL is required');
    } else {
      try {
        new URL(url);
      } catch {
        errors.push(`Invalid URL: ${url}`);
      }
    }

    const method = (parameters.method as string) ?? 'GET';
    const validMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'];
    if (!validMethods.includes(method.toUpperCase())) {
      errors.push(`Invalid HTTP method: ${method}`);
    }

    return { valid: errors.length === 0, errors };
  }
}
