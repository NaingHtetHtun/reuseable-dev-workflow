'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const testing_1 = require('@nestjs/testing');
const triggers_controller_1 = require('./triggers.controller');
const triggers_service_1 = require('./triggers.service');
describe('TriggersController', () => {
  let controller;
  beforeEach(async () => {
    const module = await testing_1.Test.createTestingModule({
      controllers: [triggers_controller_1.TriggersController],
      providers: [triggers_service_1.TriggersService],
    }).compile();
    controller = module.get(triggers_controller_1.TriggersController);
  });
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  describe('getTriggerTypes', () => {
    it('should return trigger types', () => {
      const result = controller.getTriggerTypes();
      expect(result).toHaveLength(3);
    });
  });
  describe('activateTrigger', () => {
    it('should activate a trigger', async () => {
      const result = await controller.activateTrigger('project-1', 'workflow-1', {
        type: 'manual',
        config: {},
      });
      expect(result.success).toBe(true);
    });
  });
  describe('deactivateTrigger', () => {
    it('should deactivate a trigger', async () => {
      const result = await controller.deactivateTrigger('project-1', 'workflow-1', {
        type: 'manual',
      });
      expect(result.success).toBe(true);
    });
  });
});
//# sourceMappingURL=triggers.controller.spec.js.map
