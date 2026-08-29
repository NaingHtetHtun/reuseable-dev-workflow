import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import { PrismaService } from '../../shared/database/prisma.service';
import { ProjectsService } from '../projects/projects.service';

describe('WorkflowsService', () => {
  let service: WorkflowsService;

  const mockProject = {
    id: 'project-123',
    name: 'Test Project',
    description: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockWorkflow = {
    id: 'workflow-123',
    projectId: 'project-123',
    name: 'Test Workflow',
    description: null,
    status: 'draft',
    version: 1,
    definition: {
      nodes: [{ id: 'n1', type: 'log', name: 'Log', parameters: { message: 'hi' } }],
      edges: [],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockExecution = {
    id: 'exec-123',
    workflowId: 'workflow-123',
    status: 'completed',
    input: null,
    output: { logged: true },
    error: null,
    nodeResults: { n1: { logged: true } },
    startedAt: new Date(),
    completedAt: new Date(),
  };

  const mockProjectsService = {
    findOne: jest.fn().mockResolvedValue(mockProject),
  };

  const mockPrismaService = {
    workflow: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    workflowExecution: {
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ProjectsService, useValue: mockProjectsService },
      ],
    }).compile();

    service = module.get<WorkflowsService>(WorkflowsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a workflow with valid definition', async () => {
      mockPrismaService.workflow.create.mockResolvedValueOnce(mockWorkflow);

      const result = await service.create('project-123', {
        name: 'Test Workflow',
        definition: mockWorkflow.definition,
      });

      expect(result).toEqual(mockWorkflow);
      expect(mockProjectsService.findOne).toHaveBeenCalledWith('project-123');
    });

    it('should reject invalid definition', async () => {
      await expect(
        service.create('project-123', {
          name: 'Bad Workflow',
          definition: { nodes: [], edges: [] },
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if project not found', async () => {
      mockProjectsService.findOne.mockRejectedValueOnce(new NotFoundException('Project not found'));

      await expect(
        service.create('nonexistent', {
          name: 'Test',
          definition: mockWorkflow.definition,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated workflows', async () => {
      mockPrismaService.workflow.findMany.mockResolvedValueOnce([mockWorkflow]);
      mockPrismaService.workflow.count.mockResolvedValueOnce(1);

      const result = await service.findAll('project-123', { page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should filter by status', async () => {
      mockPrismaService.workflow.findMany.mockResolvedValueOnce([]);
      mockPrismaService.workflow.count.mockResolvedValueOnce(0);

      await service.findAll('project-123', {
        page: 1,
        limit: 20,
        status: 'active',
      });

      expect(mockPrismaService.workflow.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'active' }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a workflow by ID', async () => {
      mockPrismaService.workflow.findFirst.mockResolvedValueOnce(mockWorkflow);

      const result = await service.findOne('project-123', 'workflow-123');
      expect(result.id).toBe('workflow-123');
    });

    it('should throw NotFoundException for missing workflow', async () => {
      mockPrismaService.workflow.findFirst.mockResolvedValueOnce(null);

      await expect(service.findOne('project-123', 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a workflow and increment version', async () => {
      mockPrismaService.workflow.findFirst.mockResolvedValueOnce(mockWorkflow);
      mockPrismaService.workflow.update.mockResolvedValueOnce({
        ...mockWorkflow,
        name: 'Updated',
        version: 2,
      });

      const result = await service.update('project-123', 'workflow-123', {
        name: 'Updated',
      });

      expect(result.name).toBe('Updated');
      expect(result.version).toBe(2);
    });
  });

  describe('remove', () => {
    it('should delete a workflow', async () => {
      mockPrismaService.workflow.findFirst.mockResolvedValueOnce(mockWorkflow);
      mockPrismaService.workflow.delete.mockResolvedValueOnce(mockWorkflow);

      await service.remove('project-123', 'workflow-123');

      expect(mockPrismaService.workflow.delete).toHaveBeenCalledWith({
        where: { id: 'workflow-123' },
      });
    });
  });

  describe('execute', () => {
    it('should execute a workflow and record result', async () => {
      mockPrismaService.workflow.findFirst.mockResolvedValueOnce(mockWorkflow);
      mockPrismaService.workflowExecution.create.mockResolvedValueOnce({
        ...mockExecution,
        status: 'running',
      });
      mockPrismaService.workflowExecution.update.mockResolvedValueOnce(mockExecution);

      const result = await service.execute('project-123', 'workflow-123', {});

      expect(result.status).toBe('completed');
      expect(mockPrismaService.workflowExecution.create).toHaveBeenCalled();
      expect(mockPrismaService.workflowExecution.update).toHaveBeenCalled();
    });
  });
});
