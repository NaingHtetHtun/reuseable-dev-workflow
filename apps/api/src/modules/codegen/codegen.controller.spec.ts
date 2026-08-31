import { Test, TestingModule } from '@nestjs/testing';
import { CodegenController } from './codegen.controller';
import { CodegenService } from './codegen.service';

describe('CodegenController', () => {
  let controller: CodegenController;
  let service: CodegenService;

  const mockResult = {
    success: true,
    files: [{ path: 'category.ts', content: 'export interface Category {}' }],
    warnings: [],
    errors: [],
    metadata: {
      framework: 'typescript' as const,
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
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CodegenController],
      providers: [{ provide: CodegenService, useValue: mockService }],
    }).compile();

    controller = module.get<CodegenController>(CodegenController);
    service = module.get<CodegenService>(CodegenService);
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
