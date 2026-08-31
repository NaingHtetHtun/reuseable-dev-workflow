"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const codegen_controller_1 = require("./codegen.controller");
const codegen_service_1 = require("./codegen.service");
describe('CodegenController', () => {
    let controller;
    let service;
    const mockResult = {
        success: true,
        files: [{ path: 'category.ts', content: 'export interface Category {}' }],
        warnings: [],
        errors: [],
        metadata: {
            framework: 'typescript',
            resourceCount: 1,
            componentCount: 0,
            fileCount: 1,
            generatedAt: new Date(),
        },
    };
    const mockService = {
        previewProject: jest.fn().mockResolvedValue(mockResult),
        previewResource: jest.fn().mockResolvedValue(mockResult),
        getAvailableFrameworks: jest.fn().mockReturnValue(['typescript']),
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [codegen_controller_1.CodegenController],
            providers: [{ provide: codegen_service_1.CodegenService, useValue: mockService }],
        }).compile();
        controller = module.get(codegen_controller_1.CodegenController);
        service = module.get(codegen_service_1.CodegenService);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
    describe('previewProject', () => {
        it('should preview generated code', async () => {
            const result = await controller.previewProject('project-1', {
                framework: 'typescript',
            });
            expect(result.success).toBe(true);
            expect(result.files).toHaveLength(1);
            expect(service.previewProject).toHaveBeenCalled();
        });
    });
    describe('previewResource', () => {
        it('should preview single resource code', async () => {
            const result = await controller.previewResource('project-1', 'res-1', {
                framework: 'typescript',
            });
            expect(result.success).toBe(true);
            expect(service.previewResource).toHaveBeenCalled();
        });
    });
    describe('listFrameworks', () => {
        it('should list available frameworks', async () => {
            const result = await controller.listFrameworks();
            expect(result.frameworks).toContain('typescript');
            expect(service.getAvailableFrameworks).toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=codegen.controller.spec.js.map