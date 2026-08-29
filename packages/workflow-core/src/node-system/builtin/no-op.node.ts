import {
  NodeTypeDefinition,
  NodeHandler,
  NodeExecutionContext,
  NodeExecutionResult,
} from '../interfaces';

export const noOpDefinition: NodeTypeDefinition = {
  type: 'no-op',
  displayName: 'No Operation',
  description: 'Passes input through unchanged',
  category: 'core',
  version: 1,
  parameterSchema: {
    type: 'object',
    properties: {},
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

export class NoOpNodeHandler implements NodeHandler {
  readonly type = 'no-op';

  async execute(
    input: unknown,
    _parameters: Record<string, unknown>,
    _context: NodeExecutionContext,
  ): Promise<NodeExecutionResult> {
    return { output: input };
  }
}
