import {
  NodeTypeDefinition,
  NodeHandler,
  NodeExecutionContext,
  NodeExecutionResult,
} from '../interfaces';

export const delayDefinition: NodeTypeDefinition = {
  type: 'delay',
  displayName: 'Delay',
  description: 'Waits for a specified duration before continuing',
  category: 'core',
  version: 1,
  parameterSchema: {
    type: 'object',
    properties: {
      duration: {
        type: 'number',
        description: 'Duration in milliseconds to wait',
        minimum: 0,
        maximum: 300000, // 5 minutes max
      },
    },
    required: ['duration'],
  },
  inputSchema: {
    type: 'object',
    properties: {},
  },
  outputSchema: {
    type: 'object',
    properties: {},
  },
};

export class DelayNodeHandler implements NodeHandler {
  readonly type = 'delay';

  async execute(
    input: unknown,
    parameters: Record<string, unknown>,
    _context: NodeExecutionContext,
  ): Promise<NodeExecutionResult> {
    const duration = (parameters.duration as number) ?? 0;
    await new Promise((resolve) => setTimeout(resolve, duration));
    return { output: input };
  }
}
