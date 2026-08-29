import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let controller: HealthController;
  let service: HealthService;

  const mockHealthService = {
    check: jest.fn().mockResolvedValue({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: HealthService, useValue: mockHealthService }],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    service = module.get<HealthService>(HealthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('check', () => {
    it('should return health status', async () => {
      const result = await controller.check();

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('database');
      expect(service.check).toHaveBeenCalledTimes(1);
    });

    it('should return ok status when database is connected', async () => {
      mockHealthService.check.mockResolvedValueOnce({
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected',
      });

      const result = await controller.check();

      expect(result.status).toBe('ok');
      expect(result.database).toBe('connected');
    });
  });
});
