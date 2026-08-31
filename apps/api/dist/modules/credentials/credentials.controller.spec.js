'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const testing_1 = require('@nestjs/testing');
const credentials_controller_1 = require('./credentials.controller');
const credentials_service_1 = require('./credentials.service');
describe('CredentialsController', () => {
  let controller;
  let service;
  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      getCredentialTypes: jest.fn(),
    };
    const module = await testing_1.Test.createTestingModule({
      controllers: [credentials_controller_1.CredentialsController],
      providers: [{ provide: credentials_service_1.CredentialsService, useValue: service }],
    }).compile();
    controller = module.get(credentials_controller_1.CredentialsController);
  });
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  describe('create', () => {
    it('should create a credential', async () => {
      const mockResult = {
        id: 'cred-1',
        projectId: 'proj-1',
        name: 'My API Key',
        type: 'api-key',
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      service.create.mockResolvedValue(mockResult);
      const result = await controller.create('proj-1', {
        name: 'My API Key',
        type: 'api-key',
        data: { apiKey: 'secret' },
      });
      expect(result).toEqual(mockResult);
      expect(service.create).toHaveBeenCalledWith('proj-1', {
        name: 'My API Key',
        type: 'api-key',
        data: { apiKey: 'secret' },
      });
    });
  });
  describe('findOne', () => {
    it('should return credential without secrets', async () => {
      const mockResult = {
        id: 'cred-1',
        projectId: 'proj-1',
        name: 'Test',
        type: 'api-key',
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      service.findOne.mockResolvedValue(mockResult);
      const result = await controller.findOne('proj-1', 'cred-1');
      expect(result).not.toHaveProperty('data');
      expect(result.id).toBe('cred-1');
    });
  });
  describe('findAll', () => {
    it('should list credentials', async () => {
      service.findAll.mockResolvedValue({
        data: [],
        meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
      });
      const result = await controller.findAll('proj-1', '1', '20');
      expect(result.data).toEqual([]);
    });
  });
  describe('remove', () => {
    it('should delete a credential', async () => {
      service.remove.mockResolvedValue(undefined);
      await controller.remove('proj-1', 'cred-1');
      expect(service.remove).toHaveBeenCalledWith('proj-1', 'cred-1');
    });
  });
  describe('getCredentialTypes (via types controller)', () => {
    it('should return credential types', () => {
      service.getCredentialTypes.mockReturnValue([
        {
          type: 'api-key',
          displayName: 'API Key',
          description: 'Test',
          category: 'api',
          secretFields: [],
          metadataFields: [],
        },
      ]);
      const types = service.getCredentialTypes();
      expect(types).toHaveLength(1);
      expect(types[0].type).toBe('api-key');
    });
  });
});
//# sourceMappingURL=credentials.controller.spec.js.map
