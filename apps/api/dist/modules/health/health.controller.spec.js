"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const health_controller_1 = require("./health.controller");
const health_service_1 = require("./health.service");
describe('HealthController', () => {
    let controller;
    let service;
    const mockHealthService = {
        check: jest.fn().mockResolvedValue({
            status: 'ok',
            timestamp: new Date().toISOString(),
            database: 'connected',
        }),
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [health_controller_1.HealthController],
            providers: [{ provide: health_service_1.HealthService, useValue: mockHealthService }],
        }).compile();
        controller = module.get(health_controller_1.HealthController);
        service = module.get(health_service_1.HealthService);
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
//# sourceMappingURL=health.controller.spec.js.map