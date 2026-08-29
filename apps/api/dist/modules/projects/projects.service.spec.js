"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const projects_service_1 = require("./projects.service");
const prisma_service_1 = require("../../shared/database/prisma.service");
describe('ProjectsService', () => {
    let service;
    const mockProject = {
        id: 'test-uuid-123',
        name: 'Test Project',
        description: 'A test project',
        createdAt: new Date('2026-08-29'),
        updatedAt: new Date('2026-08-29'),
    };
    const mockPrismaService = {
        project: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [projects_service_1.ProjectsService, { provide: prisma_service_1.PrismaService, useValue: mockPrismaService }],
        }).compile();
        service = module.get(projects_service_1.ProjectsService);
        jest.clearAllMocks();
    });
    describe('create', () => {
        it('should create a project with valid data', async () => {
            mockPrismaService.project.create.mockResolvedValueOnce(mockProject);
            const result = await service.create({
                name: 'Test Project',
                description: 'A test project',
            });
            expect(result).toEqual(mockProject);
            expect(mockPrismaService.project.create).toHaveBeenCalledWith({
                data: { name: 'Test Project', description: 'A test project' },
            });
        });
        it('should create a project without description', async () => {
            const projectWithoutDesc = { ...mockProject, description: null };
            mockPrismaService.project.create.mockResolvedValueOnce(projectWithoutDesc);
            const result = await service.create({ name: 'Test Project' });
            expect(result.description).toBeNull();
            expect(mockPrismaService.project.create).toHaveBeenCalledWith({
                data: { name: 'Test Project', description: null },
            });
        });
    });
    describe('findAll', () => {
        it('should return paginated projects', async () => {
            const projects = [mockProject];
            mockPrismaService.project.findMany.mockResolvedValueOnce(projects);
            mockPrismaService.project.count.mockResolvedValueOnce(1);
            const result = await service.findAll({ page: 1, limit: 20 });
            expect(result.data).toEqual(projects);
            expect(result.meta).toEqual({
                page: 1,
                limit: 20,
                total: 1,
                totalPages: 1,
            });
        });
        it('should filter by search term', async () => {
            mockPrismaService.project.findMany.mockResolvedValueOnce([]);
            mockPrismaService.project.count.mockResolvedValueOnce(0);
            await service.findAll({ page: 1, limit: 20 }, 'test');
            expect(mockPrismaService.project.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: {
                    name: { contains: 'test', mode: 'insensitive' },
                },
            }));
        });
        it('should calculate pagination correctly', async () => {
            mockPrismaService.project.findMany.mockResolvedValueOnce([]);
            mockPrismaService.project.count.mockResolvedValueOnce(45);
            const result = await service.findAll({ page: 2, limit: 10 });
            expect(result.meta).toEqual({
                page: 2,
                limit: 10,
                total: 45,
                totalPages: 5,
            });
            expect(mockPrismaService.project.findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 10, take: 10 }));
        });
    });
    describe('findOne', () => {
        it('should return a project by ID', async () => {
            mockPrismaService.project.findUnique.mockResolvedValueOnce(mockProject);
            const result = await service.findOne('test-uuid-123');
            expect(result).toEqual(mockProject);
        });
        it('should throw NotFoundException for missing project', async () => {
            mockPrismaService.project.findUnique.mockResolvedValueOnce(null);
            await expect(service.findOne('nonexistent')).rejects.toThrow(common_1.NotFoundException);
        });
    });
    describe('update', () => {
        it('should update a project', async () => {
            const updatedProject = { ...mockProject, name: 'Updated Name' };
            mockPrismaService.project.findUnique.mockResolvedValueOnce(mockProject);
            mockPrismaService.project.update.mockResolvedValueOnce(updatedProject);
            const result = await service.update('test-uuid-123', {
                name: 'Updated Name',
            });
            expect(result.name).toBe('Updated Name');
        });
        it('should throw NotFoundException for missing project', async () => {
            mockPrismaService.project.findUnique.mockResolvedValueOnce(null);
            await expect(service.update('nonexistent', { name: 'Test' })).rejects.toThrow(common_1.NotFoundException);
        });
        it('should update only provided fields', async () => {
            mockPrismaService.project.findUnique.mockResolvedValueOnce(mockProject);
            mockPrismaService.project.update.mockResolvedValueOnce(mockProject);
            await service.update('test-uuid-123', { description: 'New desc' });
            expect(mockPrismaService.project.update).toHaveBeenCalledWith({
                where: { id: 'test-uuid-123' },
                data: { description: 'New desc' },
            });
        });
    });
    describe('remove', () => {
        it('should delete a project', async () => {
            mockPrismaService.project.findUnique.mockResolvedValueOnce(mockProject);
            mockPrismaService.project.delete.mockResolvedValueOnce(mockProject);
            await service.remove('test-uuid-123');
            expect(mockPrismaService.project.delete).toHaveBeenCalledWith({
                where: { id: 'test-uuid-123' },
            });
        });
        it('should throw NotFoundException for missing project', async () => {
            mockPrismaService.project.findUnique.mockResolvedValueOnce(null);
            await expect(service.remove('nonexistent')).rejects.toThrow(common_1.NotFoundException);
        });
    });
});
//# sourceMappingURL=projects.service.spec.js.map