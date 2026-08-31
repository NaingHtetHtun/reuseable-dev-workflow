import { Test, TestingModule } from '@nestjs/testing';
import { CodegenService } from './codegen.service';
import { PrismaService } from '../../shared/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('CodegenService', () => {
  let service: CodegenService;
  let prisma: {
    resource: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
    };
  };

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

    const module: TestingModule = await Test.createTestingModule({
      providers: [CodegenService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<CodegenService>(CodegenService);
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

      await expect(
        service.previewResource('project-1', 'nonexistent', { framework: 'typescript' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAvailableFrameworks', () => {
    it('should return available frameworks', () => {
      const frameworks = service.getAvailableFrameworks();
      expect(frameworks).toContain('typescript');
    });
  });
});
