"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const codegen_service_1 = require("./codegen.service");
const prisma_service_1 = require("../../shared/database/prisma.service");
const common_1 = require("@nestjs/common");
describe('CodegenService', () => {
    let service;
    let prisma;
    const mockResource = {
        id: 'res-1',
        projectId: 'project-1',
        name: 'Category',
        displayName: 'Category',
        description: 'A product category',
        tableName: null,
        version: '1.0.0',
        status: 'draft',
        fields: [{ name: 'name', displayName: 'Name', type: 'string', required: true }],
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    beforeEach(async () => {
        prisma = {
            resource: {
                findMany: jest.fn().mockResolvedValue([mockResource]),
                findFirst: jest.fn().mockResolvedValue(mockResource),
            },
        };
        const module = await testing_1.Test.createTestingModule({
            providers: [codegen_service_1.CodegenService, { provide: prisma_service_1.PrismaService, useValue: prisma }],
        }).compile();
        service = module.get(codegen_service_1.CodegenService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('previewProject', () => {
        it('should generate code for project resources', async () => {
            const result = await service.previewProject('project-1', {
                framework: 'typescript',
            });
            expect(result.success).toBe(true);
            expect(result.files.length).toBeGreaterThan(0);
            expect(result.files[0].content).toContain('interface Category');
        });
        it('should return warning for empty project', async () => {
            prisma.resource.findMany.mockResolvedValueOnce([]);
            const result = await service.previewProject('project-1', {
                framework: 'typescript',
            });
            expect(result.success).toBe(true);
            expect(result.warnings).toContain('No resources found in this project');
            expect(result.files).toHaveLength(0);
        });
        it('should pass options to compiler', async () => {
            const result = await service.previewProject('project-1', {
                framework: 'typescript',
                includeComments: false,
            });
            expect(result.success).toBe(true);
            expect(result.metadata.framework).toBe('typescript');
        });
    });
    describe('previewResource', () => {
        it('should generate code for a single resource', async () => {
            const result = await service.previewResource('project-1', 'res-1', {
                framework: 'typescript',
            });
            expect(result.success).toBe(true);
            expect(result.files.length).toBeGreaterThan(0);
        });
        it('should throw NotFoundException for missing resource', async () => {
            prisma.resource.findFirst.mockResolvedValueOnce(null);
            await expect(service.previewResource('project-1', 'nonexistent', { framework: 'typescript' })).rejects.toThrow(common_1.NotFoundException);
        });
    });
    describe('getAvailableFrameworks', () => {
        it('should return available frameworks', () => {
            const frameworks = service.getAvailableFrameworks();
            expect(frameworks).toContain('typescript');
        });
    });
});
//# sourceMappingURL=codegen.service.spec.js.map