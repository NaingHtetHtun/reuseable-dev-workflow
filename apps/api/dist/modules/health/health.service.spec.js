'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const testing_1 = require('@nestjs/testing');
const health_service_1 = require('./health.service');
const prisma_service_1 = require('../../shared/database/prisma.service');
describe('HealthService', () => {
  let service;
  const mockPrismaService = {
    $queryRaw: jest.fn(),
  };
  beforeEach(async () => {
    const module = await testing_1.Test.createTestingModule({
      providers: [
        health_service_1.HealthService,
        { provide: prisma_service_1.PrismaService, useValue: mockPrismaService },
      ],
    }).compile();
    service = module.get(health_service_1.HealthService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('check', () => {
    it('should return ok when database is connected', async () => {
      mockPrismaService.$queryRaw.mockResolvedValueOnce([{ '?column?': 1 }]);
      const result = await service.check();
      expect(result.status).toBe('ok');
      expect(result.database).toBe('connected');
      expect(result).toHaveProperty('timestamp');
    });
    it('should return error when database is disconnected', async () => {
      mockPrismaService.$queryRaw.mockRejectedValueOnce(new Error('Connection refused'));
      const result = await service.check();
      expect(result.status).toBe('error');
      expect(result.database).toBe('disconnected');
    });
  });
});
//# sourceMappingURL=health.service.spec.js.map
