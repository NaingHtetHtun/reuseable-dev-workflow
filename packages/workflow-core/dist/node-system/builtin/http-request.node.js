export const httpRequestDefinition = {
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
export class HttpRequestNodeHandler {
    type = 'http-request';
    async execute(input, parameters, _context) {
        const url = parameters.url;
        const method = (parameters.method ?? 'GET').toUpperCase();
        const headers = parameters.headers ?? {};
        const body = parameters.body;
        const fetchOptions = {
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
        let responseBody;
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
            responseBody = await response.json();
        }
        else {
            responseBody = await response.text();
        }
        const responseHeaders = {};
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
    validate(parameters) {
        const errors = [];
        const url = parameters.url;
        if (!url) {
            errors.push('URL is required');
        }
        else {
            try {
                new URL(url);
            }
            catch {
                errors.push(`Invalid URL: ${url}`);
            }
        }
        const method = parameters.method ?? 'GET';
        const validMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'];
        if (!validMethods.includes(method.toUpperCase())) {
            errors.push(`Invalid HTTP method: ${method}`);
        }
        return { valid: errors.length === 0, errors };
    }
}
//# sourceMappingURL=http-request.node.js.map