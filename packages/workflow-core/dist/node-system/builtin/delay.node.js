export const delayDefinition = {
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
export class DelayNodeHandler {
  type = 'delay';
  async execute(input, parameters, _context) {
    const duration = parameters.duration ?? 0;
    await new Promise((resolve) => setTimeout(resolve, duration));
    return { output: input };
  }
}
//# sourceMappingURL=delay.node.js.map
