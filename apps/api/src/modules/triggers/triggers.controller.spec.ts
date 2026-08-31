import { Test, TestingModule } from '@nestjs/testing';
import { TriggersController } from './triggers.controller';
import { TriggersService } from './triggers.service';

describe('TriggersController', () => {
  let controller: TriggersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TriggersController],
      providers: [TriggersService],
    }).compile();

    controller = module.get<TriggersController>(TriggersController);
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
