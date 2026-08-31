export const logDefinition = {
  type: 'log',
  displayName: 'Log',
  description: 'Logs a message to the console',
  category: 'core',
  version: 1,
  parameterSchema: {
    type: 'object',
    properties: {
      message: {
        type: 'string',
        description: 'Message to log',
      },
    },
    required: ['message'],
  },
  inputSchema: {
    type: 'object',
    properties: {},
  },
  outputSchema: {
    type: 'object',
    properties: {
      logged: { type: 'boolean', description: 'Whether logging succeeded' },
      message: { type: 'string', description: 'The logged message' },
      input: { type: 'object', description: 'The input received' },
    },
  },
};
export class LogNodeHandler {
  type = 'log';
  async execute(input, parameters, _context) {
    const message = parameters.message ?? 'No message';
    // eslint-disable-next-line no-console
    console.log(`[Workflow ${_context.nodeId}] ${message}`);
    return { output: { logged: true, message, input } };
  }
}
//# sourceMappingURL=log.node.js.map
