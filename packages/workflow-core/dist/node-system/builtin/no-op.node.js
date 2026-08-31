export const noOpDefinition = {
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
export class NoOpNodeHandler {
  type = 'no-op';
  async execute(input, _parameters, _context) {
    return { output: input };
  }
}
//# sourceMappingURL=no-op.node.js.map
