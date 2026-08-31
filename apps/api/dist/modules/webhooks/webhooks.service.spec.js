"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const webhooks_service_1 = require("./webhooks.service");
const triggers_service_1 = require("../triggers/triggers.service");
const workflows_service_1 = require("../workflows/workflows.service");
const workflow_core_1 = require("@devflow/workflow-core");
describe('WebhooksService', () => {
    let service;
    let triggersService;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                webhooks_service_1.WebhooksService,
                triggers_service_1.TriggersService,
                {
                    provide: workflows_service_1.WorkflowsService,
                    useValue: {
                        findOne: jest.fn().mockResolvedValue({
                            id: 'workflow-1',
                            name: 'Test Workflow',
                            definition: { nodes: [], edges: [] },
                        }),
                    },
                },
            ],
        }).compile();
        service = module.get(webhooks_service_1.WebhooksService);
        triggersService = module.get(triggers_service_1.TriggersService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('handleWebhook', () => {
        it('should reject invalid webhook token', async () => {
            const result = await service.handleWebhook('invalid-token', {}, {});
            expect(result.status).toBe('error');
            expect(result.error).toBe('Invalid webhook token');
        });
        it('should process valid webhook request', async () => {
            const activateResult = await triggersService.activateTrigger('workflow-1', 'webhook', {
                method: 'POST',
                authentication: 'none',
            });
            const url = activateResult.endpoint.url;
            const token = url.split('/').pop();
            const result = await service.handleWebhook(token, {}, { event: 'test' });
            expect(result.status).toBe('executed');
            expect(result.executionId).toBeDefined();
        });
        it('should validate HMAC signature when configured', async () => {
            const secret = 'webhook-secret';
            const activateResult = await triggersService.activateTrigger('workflow-1', 'webhook', {
                method: 'POST',
                authentication: 'hmac',
                secret,
            });
            const url = activateResult.endpoint.url;
            const token = url.split('/').pop();
            const payload = JSON.stringify({ event: 'test' });
            const signature = workflow_core_1.WebhookTriggerHandler.generateSignature(payload, secret);
            const result = await service.handleWebhook(token, { 'x-webhook-signature': signature }, { event: 'test' });
            expect(result.status).toBe('executed');
        });
        it('should reject invalid HMAC signature', async () => {
            const secret = 'webhook-secret';
            const activateResult = await triggersService.activateTrigger('workflow-1', 'webhook', {
                method: 'POST',
                authentication: 'hmac',
                secret,
            });
            const url = activateResult.endpoint.url;
            const token = url.split('/').pop();
            const result = await service.handleWebhook(token, { 'x-webhook-signature': 'sha256=invalidsignature' }, { event: 'test' });
            expect(result.status).toBe('error');
            expect(result.error).toBe('Invalid webhook signature');
        });
        it('should handle duplicate deliveries (idempotency)', async () => {
            const activateResult = await triggersService.activateTrigger('workflow-1', 'webhook', {
                method: 'POST',
                authentication: 'none',
            });
            const url = activateResult.endpoint.url;
            const token = url.split('/').pop();
            const eventId = 'test-event-1';
            const result1 = await service.handleWebhook(token, { 'x-webhook-id': eventId }, { event: 'test' });
            expect(result1.status).toBe('executed');
            const result2 = await service.handleWebhook(token, { 'x-webhook-id': eventId }, { event: 'test' });
            expect(result2.status).toBe('skipped');
            expect(result2.reason).toBe('duplicate');
        });
    });
});
//# sourceMappingURL=webhooks.service.spec.js.map