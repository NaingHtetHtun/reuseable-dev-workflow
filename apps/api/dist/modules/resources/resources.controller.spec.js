'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const testing_1 = require('@nestjs/testing');
const resources_controller_1 = require('./resources.controller');
const resources_service_1 = require('./resources.service');
describe('ResourcesController', () => {
  let controller;
  let service;
  const mockResource = {
    id: 'res-1',
    projectId: 'project-1',
    name: 'Category',
    displayName: 'Category',
    description: 'A test resource',
    version: '1.0.0',
    status: 'draft',
    fields: [{ name: 'name', displayName: 'Name', type: 'string', required: true }],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const mockService = {
    create: jest.fn().mockResolvedValue(mockResource),
    findAll: jest.fn().mockResolvedValue({
      data: [mockResource],
      meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
    }),
    findOne: jest.fn().mockResolvedValue(mockResource),
    update: jest.fn().mockResolvedValue(mockResource),
    remove: jest.fn().mockResolvedValue(undefined),
    createVersion: jest.fn().mockResolvedValue({
      id: 'ver-1',
      resourceId: 'res-1',
      version: '1.0.0',
      definition: mockResource,
      createdAt: new Date(),
    }),
    listVersions: jest.fn().mockResolvedValue([]),
    getVersion: jest.fn().mockResolvedValue({
      id: 'ver-1',
      resourceId: 'res-1',
      version: '1.0.0',
      definition: mockResource,
      createdAt: new Date(),
    }),
    generatePrisma: jest.fn().mockResolvedValue({ prisma: 'model Category {}' }),
    generateValidation: jest.fn().mockResolvedValue({ dto: 'export class CategoryCreateDto {}' }),
  };
  beforeEach(async () => {
    const module = await testing_1.Test.createTestingModule({
      controllers: [resources_controller_1.ResourcesController],
      providers: [{ provide: resources_service_1.ResourcesService, useValue: mockService }],
    }).compile();
    controller = module.get(resources_controller_1.ResourcesController);
    service = module.get(resources_service_1.ResourcesService);
  });
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  describe('create', () => {
    it('should create a resource', async () => {
      const result = await controller.create('project-1', {
        name: 'Category',
        displayName: 'Category',
        fields: [{ name: 'name', displayName: 'Name', type: 'string', required: true }],
      });
      expect(result.name).toBe('Category');
      expect(service.create).toHaveBeenCalled();
    });
  });
  describe('findAll', () => {
    it('should list resources', async () => {
      const result = await controller.findAll('project-1', '1', '20');
      expect(result.data).toHaveLength(1);
      expect(service.findAll).toHaveBeenCalled();
    });
  });
  describe('findOne', () => {
    it('should get a resource', async () => {
      const result = await controller.findOne('project-1', 'res-1');
      expect(result.id).toBe('res-1');
      expect(service.findOne).toHaveBeenCalled();
    });
  });
  describe('update', () => {
    it('should update a resource', async () => {
      const result = await controller.update('project-1', 'res-1', {
        displayName: 'Updated',
      });
      expect(result).toBeDefined();
      expect(service.update).toHaveBeenCalled();
    });
  });
  describe('remove', () => {
    it('should delete a resource', async () => {
      await controller.remove('project-1', 'res-1');
      expect(service.remove).toHaveBeenCalled();
    });
  });
  describe('createVersion', () => {
    it('should create a version', async () => {
      const result = await controller.createVersion('project-1', 'res-1', {
        version: '1.0.1',
        changelog: 'Bug fix',
      });
      expect(result).toBeDefined();
      expect(service.createVersion).toHaveBeenCalled();
    });
  });
  describe('listVersions', () => {
    it('should list versions', async () => {
      const result = await controller.listVersions('project-1', 'res-1');
      expect(result).toBeDefined();
      expect(service.listVersions).toHaveBeenCalled();
    });
  });
  describe('getVersion', () => {
    it('should get a version', async () => {
      const result = await controller.getVersion('project-1', 'res-1', '1.0.0');
      expect(result).toBeDefined();
      expect(service.getVersion).toHaveBeenCalled();
    });
  });
  describe('generatePrisma', () => {
    it('should generate prisma model', async () => {
      const result = await controller.generatePrisma('project-1', 'res-1');
      expect(result.prisma).toContain('model Category');
      expect(service.generatePrisma).toHaveBeenCalled();
    });
  });
  describe('generateValidation', () => {
    it('should generate validation DTO', async () => {
      const result = await controller.generateValidation('project-1', 'res-1', {
        operation: 'create',
      });
      expect(result.dto).toContain('CategoryCreateDto');
      expect(service.generateValidation).toHaveBeenCalled();
    });
  });
});
//# sourceMappingURL=resources.controller.spec.js.map
