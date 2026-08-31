export const setVariableDefinition = {
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
export class SetVariableNodeHandler {
  type = 'set-variable';
  async execute(input, parameters, _context) {
    const name = parameters.name ?? 'variable';
    const value = parameters.value;
    const inputObj = input ?? {};
    return { output: { ...inputObj, [name]: value } };
  }
}
//# sourceMappingURL=set-variable.node.js.map
