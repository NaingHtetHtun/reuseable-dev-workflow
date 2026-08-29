import {
  NodeTypeDefinition,
  NodeHandler,
  NodeExecutionContext,
  NodeExecutionResult,
} from '../interfaces';

export const setVariableDefinition: NodeTypeDefinition = {
  type: 'set-variable',
  displayName: 'Set Variable',
  description: 'Sets a named variable in the execution context',
  category: 'core',
  version: 1,
  parameterSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Variable name',
      },
      value: {
        type: 'string',
        description: 'Variable value',
      },
    },
    required: ['name', 'value'],
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

export class SetVariableNodeHandler implements NodeHandler {
  readonly type = 'set-variable';

  async execute(
    input: unknown,
    parameters: Record<string, unknown>,
    _context: NodeExecutionContext,
  ): Promise<NodeExecutionResult> {
    const name = (parameters.name as string) ?? 'variable';
    const value = parameters.value;
    const inputObj = (input as Record<string, unknown>) ?? {};
    return { output: { ...inputObj, [name]: value } };
  }
}
