import {
  NodeTypeDefinition,
  NodeHandler,
  NodeExecutionContext,
  NodeExecutionResult,
} from '../interfaces';

export const logDefinition: NodeTypeDefinition = {
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

export class LogNodeHandler implements NodeHandler {
  readonly type = 'log';

  async execute(
    input: unknown,
    parameters: Record<string, unknown>,
    _context: NodeExecutionContext,
  ): Promise<NodeExecutionResult> {
    const message = (parameters.message as string) ?? 'No message';
    // eslint-disable-next-line no-console
    console.log(`[Workflow ${_context.nodeId}] ${message}`);
    return { output: { logged: true, message, input } };
  }
}
