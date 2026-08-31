"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const components_controller_1 = require("./components.controller");
const components_service_1 = require("./components.service");
describe('ComponentsController', () => {
    let controller;
    let service;
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
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    const mockService = {
        create: jest.fn().mockResolvedValue(mockComponent),
        findAll: jest.fn().mockResolvedValue({
            data: [mockComponent],
            meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
        }),
        findOne: jest.fn().mockResolvedValue(mockComponent),
        update: jest.fn().mockResolvedValue(mockComponent),
        remove: jest.fn().mockResolvedValue(undefined),
        createVersion: jest.fn().mockResolvedValue({
            id: 'ver-1',
            componentId: 'comp-1',
            version: '1.0.0',
            definition: mockComponent,
            createdAt: new Date(),
        }),
        listVersions: jest.fn().mockResolvedValue([]),
        getVersion: jest.fn().mockResolvedValue({
            id: 'ver-1',
            componentId: 'comp-1',
            version: '1.0.0',
            definition: mockComponent,
            createdAt: new Date(),
        }),
        clone: jest.fn().mockResolvedValue(mockComponent),
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [components_controller_1.ComponentsController],
            providers: [{ provide: components_service_1.ComponentsService, useValue: mockService }],
        }).compile();
        controller = module.get(components_controller_1.ComponentsController);
        service = module.get(components_service_1.ComponentsService);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
    describe('create', () => {
        it('should create a component', async () => {
            const result = await controller.create('project-1', {
                name: 'test-component',
                displayName: 'Test Component',
            });
            expect(result.name).toBe('test-component');
            expect(service.create).toHaveBeenCalled();
        });
    });
    describe('findAll', () => {
        it('should list components', async () => {
            const result = await controller.findAll('project-1', '1', '20');
            expect(result.data).toHaveLength(1);
            expect(service.findAll).toHaveBeenCalled();
        });
    });
    describe('findOne', () => {
        it('should get a component', async () => {
            const result = await controller.findOne('project-1', 'comp-1');
            expect(result.id).toBe('comp-1');
            expect(service.findOne).toHaveBeenCalled();
        });
    });
    describe('update', () => {
        it('should update a component', async () => {
            const result = await controller.update('project-1', 'comp-1', {
                displayName: 'Updated',
            });
            expect(result).toBeDefined();
            expect(service.update).toHaveBeenCalled();
        });
    });
    describe('remove', () => {
        it('should delete a component', async () => {
            await controller.remove('project-1', 'comp-1');
            expect(service.remove).toHaveBeenCalled();
        });
    });
    describe('createVersion', () => {
        it('should create a version', async () => {
            const result = await controller.createVersion('project-1', 'comp-1', {
                version: '1.0.1',
                changelog: 'Bug fix',
            });
            expect(result).toBeDefined();
            expect(service.createVersion).toHaveBeenCalled();
        });
    });
    describe('listVersions', () => {
        it('should list versions', async () => {
            const result = await controller.listVersions('project-1', 'comp-1');
            expect(result).toBeDefined();
            expect(service.listVersions).toHaveBeenCalled();
        });
    });
    describe('getVersion', () => {
        it('should get a version', async () => {
            const result = await controller.getVersion('project-1', 'comp-1', '1.0.0');
            expect(result).toBeDefined();
            expect(service.getVersion).toHaveBeenCalled();
        });
    });
    describe('clone', () => {
        it('should clone a component', async () => {
            const result = await controller.clone('project-1', 'comp-1', {
                name: 'cloned-component',
            });
            expect(result).toBeDefined();
            expect(service.clone).toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=components.controller.spec.js.map