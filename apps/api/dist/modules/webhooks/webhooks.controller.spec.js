'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const testing_1 = require('@nestjs/testing');
const webhooks_controller_1 = require('./webhooks.controller');
const webhooks_service_1 = require('./webhooks.service');
const triggers_service_1 = require('../triggers/triggers.service');
const workflows_service_1 = require('../workflows/workflows.service');
describe('WebhooksController', () => {
  let controller;
  beforeEach(async () => {
    const module = await testing_1.Test.createTestingModule({
      controllers: [webhooks_controller_1.WebhooksController],
      providers: [
        webhooks_service_1.WebhooksService,
        triggers_service_1.TriggersService,
        {
          provide: workflows_service_1.WorkflowsService,
          useValue: {
            findOne: jest.fn().mockResolvedValue({
              id: 'workflow-1',
              name: 'Test',
              definition: { nodes: [], edges: [] },
            }),
          },
        },
      ],
    }).compile();
    controller = module.get(webhooks_controller_1.WebhooksController);
  });
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  describe('handleWebhook', () => {
    it('should reject invalid token', async () => {
      const result = await controller.handleWebhook('invalid', {}, {});
      expect(result.status).toBe('error');
    });
  });
});
//# sourceMappingURL=webhooks.controller.spec.js.map
