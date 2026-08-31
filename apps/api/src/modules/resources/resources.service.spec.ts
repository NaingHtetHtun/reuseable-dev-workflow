import { Test, TestingModule } from '@nestjs/testing';
import { ResourcesService } from './resources.service';
import { PrismaService } from '../../shared/database/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

describe('ResourcesService', () => {
  let service: ResourcesService;
  let prisma: {
    resource: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    resourceVersion: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      deleteMany: jest.Mock;
    };
  };

  const mockProject = { id: 'project-1', name: 'Test Project' };

  const mockResource = {
    id: 'res-1',
    projectId: 'project-1',
    name: 'Category',
    displayName: 'Category',
    description: 'A test resource',
    tableName: null,
    version: '1.0.0',
    status: 'draft',
    fields: [{ name: 'name', displayName: 'Name', type: 'string', required: true }],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockVersion = {
    id: 'ver-1',
    resourceId: 'res-1',
    version: '1.0.0',
    definition: mockResource,
    changelog: 'Initial version',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      resource: {
        create: jest.fn().mockResolvedValue(mockResource),
        findMany: jest.fn().mockResolvedValue([mockResource]),
        findFirst: jest.fn().mockResolvedValue(mockResource),
        count: jest.fn().mockResolvedValue(1),
        update: jest.fn().mockResolvedValue(mockResource),
        delete: jest.fn().mockResolvedValue(undefined),
      },
      resourceVersion: {
        create: jest.fn().mockResolvedValue(mockVersion),
        findMany: jest.fn().mockResolvedValue([mockVersion]),
        findFirst: jest.fn().mockResolvedValue(mockVersion),
        deleteMany: jest.fn().mockResolvedValue(undefined),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResourcesService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: ProjectsService,
          useValue: { findOne: jest.fn().mockResolvedValue(mockProject) },
        },
      ],
    }).compile();

    service = module.get<ResourcesService>(ResourcesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a resource', async () => {
      prisma.resource.findFirst.mockResolvedValueOnce(null);

      const result = await service.create('project-1', {
        name: 'Category',
        displayName: 'Category',
        fields: [{ name: 'name', displayName: 'Name', type: 'string', required: true }],
      });

      expect(result.name).toBe('Category');
      expect(result.version).toBe('1.0.0');
      expect(result.status).toBe('draft');
    });

    it('should throw ConflictException for duplicate name', async () => {
      prisma.resource.findFirst.mockResolvedValueOnce(mockResource);

      await expect(
        service.create('project-1', {
          name: 'Category',
          displayName: 'Category',
          fields: [{ name: 'name', displayName: 'Name', type: 'string', required: true }],
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create initial version', async () => {
      prisma.resource.findFirst.mockResolvedValueOnce(null);

      await service.create('project-1', {
        name: 'Category',
        displayName: 'Category',
        fields: [{ name: 'name', displayName: 'Name', type: 'string', required: true }],
      });

      expect(prisma.resourceVersion.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid resource', async () => {
      prisma.resource.findFirst.mockResolvedValueOnce(null);

      await expect(
        service.create('project-1', {
          name: 'category', // Not PascalCase
          displayName: 'Category',
          fields: [],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should list resources with pagination', async () => {
      const result = await service.findAll('project-1', { page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should filter by search', async () => {
      await service.findAll('project-1', { search: 'test' });

      expect(prisma.resource.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ name: expect.objectContaining({ contains: 'test' }) }),
            ]),
          }),
        }),
      );
    });

    it('should filter by status', async () => {
      await service.findAll('project-1', { status: 'published' });

      expect(prisma.resource.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'published' }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a resource', async () => {
      const result = await service.findOne('project-1', 'res-1');
      expect(result.id).toBe('res-1');
    });

    it('should throw NotFoundException for missing resource', async () => {
      prisma.resource.findFirst.mockResolvedValueOnce(null);

      await expect(service.findOne('project-1', 'nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a resource', async () => {
      const result = await service.update('project-1', 'res-1', {
        displayName: 'Updated Name',
      });

      expect(result).toBeDefined();
      expect(prisma.resource.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException for missing resource', async () => {
      prisma.resource.findFirst.mockResolvedValueOnce(null);

      await expect(
        service.update('project-1', 'nonexistent', { displayName: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a resource', async () => {
      await service.remove('project-1', 'res-1');

      expect(prisma.resourceVersion.deleteMany).toHaveBeenCalledWith({
        where: { resourceId: 'res-1' },
      });
      expect(prisma.resource.delete).toHaveBeenCalledWith({ where: { id: 'res-1' } });
    });

    it('should throw NotFoundException for missing resource', async () => {
      prisma.resource.findFirst.mockResolvedValueOnce(null);

      await expect(service.remove('project-1', 'nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createVersion', () => {
    it('should create a new version', async () => {
      prisma.resourceVersion.findFirst.mockResolvedValueOnce(null);

      const result = await service.createVersion('project-1', 'res-1', '1.0.1', 'Bug fix');

      expect(result).toBeDefined();
      expect(result.version).toBe('1.0.0'); // Mock returns original
    });

    it('should throw NotFoundException for missing resource', async () => {
      prisma.resource.findFirst.mockResolvedValueOnce(null);

      await expect(service.createVersion('project-1', 'nonexistent', '1.0.0')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException for invalid version', async () => {
      await expect(service.createVersion('project-1', 'res-1', 'invalid')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException for duplicate version', async () => {
      prisma.resourceVersion.findFirst.mockResolvedValueOnce(mockVersion);

      await expect(service.createVersion('project-1', 'res-1', '1.0.0')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('listVersions', () => {
    it('should list versions', async () => {
      const result = await service.listVersions('project-1', 'res-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('generatePrisma', () => {
    it('should generate Prisma model', async () => {
      const result = await service.generatePrisma('project-1', 'res-1');

      expect(result.prisma).toContain('model Category {');
      expect(result.prisma).toContain('name');
    });

    it('should throw NotFoundException for missing resource', async () => {
      prisma.resource.findFirst.mockResolvedValueOnce(null);

      await expect(service.generatePrisma('project-1', 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('generateValidation', () => {
    it('should generate create DTO', async () => {
      const result = await service.generateValidation('project-1', 'res-1', 'create');

      expect(result.dto).toContain('CategoryCreateDto');
      expect(result.dto).toContain('name');
    });

    it('should generate update DTO', async () => {
      const result = await service.generateValidation('project-1', 'res-1', 'update');

      expect(result.dto).toContain('CategoryUpdateDto');
    });

    it('should generate response DTO', async () => {
      const result = await service.generateValidation('project-1', 'res-1', 'response');

      expect(result.dto).toContain('CategoryResponse');
      expect(result.dto).toContain('id!');
    });

    it('should throw NotFoundException for missing resource', async () => {
      prisma.resource.findFirst.mockResolvedValueOnce(null);

      await expect(
        service.generateValidation('project-1', 'nonexistent', 'create'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
