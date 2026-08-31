"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const preview_controller_1 = require("./preview.controller");
const preview_service_1 = require("./preview.service");
describe('PreviewController', () => {
    let controller;
    const simpleWorkflow = {
        nodes: [
            {
                id: 'log-1',
                type: 'log',
                name: 'Log Message',
                parameters: { message: 'Hello from preview' },
            },
        ],
        edges: [],
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [preview_controller_1.PreviewController],
            providers: [preview_service_1.PreviewService],
        }).compile();
        controller = module.get(preview_controller_1.PreviewController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
    describe('previewWorkflow', () => {
        it('should preview a workflow', async () => {
            const result = await controller.previewWorkflow({
                definition: simpleWorkflow,
                mode: 'validate',
            });
            expect(result.success).toBe(true);
            expect(result.mode).toBe('validate');
        });
        it('should handle execute mode', async () => {
            const result = await controller.previewWorkflow({
                definition: simpleWorkflow,
                mode: 'execute',
            });
            expect(result.success).toBe(true);
            expect(result.mode).toBe('execute');
        });
        it('should pass input data', async () => {
            const result = await controller.previewWorkflow({
                definition: simpleWorkflow,
                mode: 'execute',
                input: { test: true },
            });
            expect(result.success).toBe(true);
        });
    });
    describe('validateWorkflow', () => {
        it('should validate a workflow', async () => {
            const result = await controller.validateWorkflow({
                definition: simpleWorkflow,
                mode: 'validate',
            });
            expect(result.success).toBe(true);
            expect(result.mode).toBe('validate');
        });
    });
    describe('previewNode', () => {
        it('should preview a node', async () => {
            const result = await controller.previewNode({
                definition: simpleWorkflow,
                nodeId: 'log-1',
                input: { message: 'Test' },
            });
            expect(result.success).toBe(true);
            expect(result.nodeId).toBe('log-1');
        });
        it('should handle non-existent node', async () => {
            const result = await controller.previewNode({
                definition: simpleWorkflow,
                nodeId: 'nonexistent',
            });
            expect(result.success).toBe(false);
            expect(result.error).toContain('Node not found');
        });
    });
});
//# sourceMappingURL=preview.controller.spec.js.map