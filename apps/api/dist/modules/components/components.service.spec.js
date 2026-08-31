'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const testing_1 = require('@nestjs/testing');
const components_service_1 = require('./components.service');
const prisma_service_1 = require('../../shared/database/prisma.service');
const projects_service_1 = require('../projects/projects.service');
const common_1 = require('@nestjs/common');
describe('ComponentsService', () => {
  let service;
  let prisma;
  const mockProject = { id: 'project-1', name: 'Test Project' };
  const mockComponent = {
    id: 'comp-1',
    projectId: 'project-1',
    name: 'test-component',
    displayName: 'Test Component',
    description: 'A test component',
    version: '1.0.0',
    status: 'draft',
    category: 'test',
    tags: ['test'],
    author: 'Test Author',
    configSchema: { type: 'object', properties: {} },
    credentialSchema: { required: [] },
    inputSchema: { type: 'object', properties: {} },
    outputSchema: { type: 'object', properties: {} },
    implementation: { type: 'workflow' },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const mockVersion = {
    id: 'ver-1',
    componentId: 'comp-1',
    version: '1.0.0',
    definition: mockComponent,
    changelog: 'Initial version',
    createdAt: new Date(),
  };
  beforeEach(async () => {
    prisma = {
      component: {
        create: jest.fn().mockResolvedValue(mockComponent),
        findMany: jest.fn().mockResolvedValue([mockComponent]),
        findFirst: jest.fn().mockResolvedValue(mockComponent),
        count: jest.fn().mockResolvedValue(1),
        update: jest.fn().mockResolvedValue(mockComponent),
        delete: jest.fn().mockResolvedValue(undefined),
      },
      componentVersion: {
        create: jest.fn().mockResolvedValue(mockVersion),
        findMany: jest.fn().mockResolvedValue([mockVersion]),
        findFirst: jest.fn().mockResolvedValue(mockVersion),
        deleteMany: jest.fn().mockResolvedValue(undefined),
      },
    };
    const module = await testing_1.Test.createTestingModule({
      providers: [
        components_service_1.ComponentsService,
        { provide: prisma_service_1.PrismaService, useValue: prisma },
        {
          provide: projects_service_1.ProjectsService,
          useValue: { findOne: jest.fn().mockResolvedValue(mockProject) },
        },
      ],
    }).compile();
    service = module.get(components_service_1.ComponentsService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('create', () => {
    it('should create a component', async () => {
      prisma.component.findFirst.mockResolvedValueOnce(null);
      const result = await service.create('project-1', {
        name: 'test-component',
        displayName: 'Test Component',
      });
      expect(result.name).toBe('test-component');
      expect(result.displayName).toBe('Test Component');
      expect(result.version).toBe('1.0.0');
      expect(result.status).toBe('draft');
    });
    it('should throw ConflictException for duplicate name', async () => {
      prisma.component.findFirst.mockResolvedValueOnce(mockComponent);
      await expect(
        service.create('project-1', {
          name: 'test-component',
          displayName: 'Test Component',
        }),
      ).rejects.toThrow(common_1.ConflictException);
    });
    it('should create initial version', async () => {
      prisma.component.findFirst.mockResolvedValueOnce(null);
      await service.create('project-1', {
        name: 'test-component',
        displayName: 'Test Component',
      });
      expect(prisma.componentVersion.create).toHaveBeenCalled();
    });
  });
  describe('findAll', () => {
    it('should list components with pagination', async () => {
      const result = await service.findAll('project-1', {
        page: 1,
        limit: 10,
      });
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
    it('should filter by search', async () => {
      await service.findAll('project-1', { search: 'test' });
      expect(prisma.component.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ name: expect.objectContaining({ contains: 'test' }) }),
            ]),
          }),
        }),
      );
    });
    it('should filter by category', async () => {
      await service.findAll('project-1', { category: 'auth' });
      expect(prisma.component.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ category: 'auth' }),
        }),
      );
    });
    it('should filter by status', async () => {
      await service.findAll('project-1', { status: 'published' });
      expect(prisma.component.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'published' }),
        }),
      );
    });
  });
  describe('findOne', () => {
    it('should return a component', async () => {
      const result = await service.findOne('project-1', 'comp-1');
      expect(result.id).toBe('comp-1');
    });
    it('should throw NotFoundException for missing component', async () => {
      prisma.component.findFirst.mockResolvedValueOnce(null);
      await expect(service.findOne('project-1', 'nonexistent')).rejects.toThrow(
        common_1.NotFoundException,
      );
    });
  });
  describe('update', () => {
    it('should update a component', async () => {
      const result = await service.update('project-1', 'comp-1', {
        displayName: 'Updated Name',
      });
      expect(result.displayName).toBe('Test Component');
      expect(prisma.component.update).toHaveBeenCalled();
    });
    it('should throw NotFoundException for missing component', async () => {
      prisma.component.findFirst.mockResolvedValueOnce(null);
      await expect(
        service.update('project-1', 'nonexistent', { displayName: 'Test' }),
      ).rejects.toThrow(common_1.NotFoundException);
    });
  });
  describe('remove', () => {
    it('should delete a component', async () => {
      await service.remove('project-1', 'comp-1');
      expect(prisma.componentVersion.deleteMany).toHaveBeenCalledWith({
        where: { componentId: 'comp-1' },
      });
      expect(prisma.component.delete).toHaveBeenCalledWith({
        where: { id: 'comp-1' },
      });
    });
    it('should throw NotFoundException for missing component', async () => {
      prisma.component.findFirst.mockResolvedValueOnce(null);
      await expect(service.remove('project-1', 'nonexistent')).rejects.toThrow(
        common_1.NotFoundException,
      );
    });
  });
  describe('createVersion', () => {
    it('should create a new version', async () => {
      prisma.componentVersion.findFirst.mockResolvedValueOnce(null);
      const result = await service.createVersion('project-1', 'comp-1', '1.0.1', 'Bug fix');
      expect(result.version).toBe('1.0.0');
    });
    it('should throw NotFoundException for missing component', async () => {
      prisma.component.findFirst.mockResolvedValueOnce(null);
      await expect(service.createVersion('project-1', 'nonexistent', '1.0.0')).rejects.toThrow(
        common_1.NotFoundException,
      );
    });
    it('should throw BadRequestException for invalid version', async () => {
      await expect(service.createVersion('project-1', 'comp-1', 'invalid')).rejects.toThrow(
        common_1.BadRequestException,
      );
    });
    it('should throw ConflictException for duplicate version', async () => {
      prisma.componentVersion.findFirst.mockResolvedValueOnce(mockVersion);
      await expect(service.createVersion('project-1', 'comp-1', '1.0.0')).rejects.toThrow(
        common_1.ConflictException,
      );
    });
  });
  describe('listVersions', () => {
    it('should list versions', async () => {
      const result = await service.listVersions('project-1', 'comp-1');
      expect(result).toHaveLength(1);
    });
  });
  describe('clone', () => {
    it('should clone a component', async () => {
      prisma.component.findFirst.mockResolvedValueOnce(mockComponent).mockResolvedValueOnce(null);
      const result = await service.clone('project-1', 'comp-1', 'cloned-component');
      expect(result.name).toBe('test-component');
      expect(prisma.component.create).toHaveBeenCalled();
    });
    it('should throw ConflictException for duplicate name', async () => {
      prisma.component.findFirst
        .mockResolvedValueOnce(mockComponent)
        .mockResolvedValueOnce(mockComponent);
      await expect(service.clone('project-1', 'comp-1', 'existing-name')).rejects.toThrow(
        common_1.ConflictException,
      );
    });
  });
});
//# sourceMappingURL=components.service.spec.js.map
