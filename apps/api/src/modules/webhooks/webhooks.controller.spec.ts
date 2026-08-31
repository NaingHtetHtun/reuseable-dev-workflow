import { Test, TestingModule } from '@nestjs/testing';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { TriggersService } from '../triggers/triggers.service';
import { WorkflowsService } from '../workflows/workflows.service';

describe('WebhooksController', () => {
  let controller: WebhooksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhooksController],
      providers: [
        WebhooksService,
        TriggersService,
        {
          provide: WorkflowsService,
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

    controller = module.get<WebhooksController>(WebhooksController);
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
