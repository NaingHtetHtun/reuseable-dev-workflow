import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../shared/database/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import {
  CreateWorkflowDto,
  UpdateWorkflowDto,
  ExecuteWorkflowDto,
  WorkflowResponseDto,
  WorkflowQueryDto,
  ExecutionResponseDto,
} from './dto';
import {
  WorkflowDefinition,
  validateWorkflowDefinition,
  WorkflowExecutor,
} from '@devflow/workflow-core';
import { PaginationDto } from '../../shared/dto/pagination.dto';

@Injectable()
export class WorkflowsService {
  private readonly logger = new Logger(WorkflowsService.name);
  private readonly executor = new WorkflowExecutor({
    log: (msg) => this.logger.log(msg),
    error: (msg, stack) => this.logger.error(msg, stack),
    warn: (msg) => this.logger.warn(msg),
  });

  constructor(
    private readonly prisma: PrismaService,
    private readonly projectsService: ProjectsService,
  ) {}

  async create(projectId: string, dto: CreateWorkflowDto): Promise<WorkflowResponseDto> {
    // Verify project exists
    await this.projectsService.findOne(projectId);

    // Validate definition
    const validation = validateWorkflowDefinition(dto.definition as WorkflowDefinition);
    if (!validation.valid) {
      throw new BadRequestException(`Invalid workflow definition: ${validation.errors.join('; ')}`);
    }

    const workflow = await this.prisma.workflow.create({
      data: {
        projectId,
        name: dto.name,
        description: dto.description ?? null,
        definition: dto.definition as unknown as Prisma.InputJsonValue,
      },
    });

    this.logger.log(`Created workflow: ${workflow.id}`);
    return workflow as WorkflowResponseDto;
  }

  async findAll(
    projectId: string,
    query: WorkflowQueryDto,
  ): Promise<{
    data: WorkflowResponseDto[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const { page = 1, limit = 20, search, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.WorkflowWhereInput = {
      projectId,
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
      ...(status && { status }),
    };

    const [data, total] = await Promise.all([
      this.prisma.workflow.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.workflow.count({ where }),
    ]);

    return {
      data: data as WorkflowResponseDto[],
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(projectId: string, id: string): Promise<WorkflowResponseDto> {
    const workflow = await this.prisma.workflow.findFirst({
      where: { id, projectId },
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    return workflow as WorkflowResponseDto;
  }

  async update(
    projectId: string,
    id: string,
    dto: UpdateWorkflowDto,
  ): Promise<WorkflowResponseDto> {
    await this.findOne(projectId, id);

    // Validate definition if provided
    if (dto.definition) {
      const validation = validateWorkflowDefinition(dto.definition as WorkflowDefinition);
      if (!validation.valid) {
        throw new BadRequestException(
          `Invalid workflow definition: ${validation.errors.join('; ')}`,
        );
      }
    }

    const workflow = await this.prisma.workflow.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.definition !== undefined && {
          definition: dto.definition as unknown as Prisma.InputJsonValue,
        }),
        version: { increment: 1 },
      },
    });

    this.logger.log(`Updated workflow: ${workflow.id} (v${workflow.version})`);
    return workflow as WorkflowResponseDto;
  }

  async remove(projectId: string, id: string): Promise<void> {
    await this.findOne(projectId, id);

    await this.prisma.workflow.delete({ where: { id } });
    this.logger.log(`Deleted workflow: ${id}`);
  }

  async execute(
    projectId: string,
    id: string,
    dto: ExecuteWorkflowDto,
  ): Promise<ExecutionResponseDto> {
    const workflow = await this.findOne(projectId, id);

    const execution = await this.prisma.workflowExecution.create({
      data: {
        workflowId: id,
        status: 'running',
        input: (dto.input as Prisma.InputJsonValue) ?? null,
      },
    });

    this.logger.log(`Started execution: ${execution.id} for workflow: ${id}`);

    // Execute workflow
    const result = await this.executor.execute(
      workflow.id,
      execution.id,
      workflow.definition as WorkflowDefinition,
      dto.input ?? null,
    );

    // Update execution with result
    const updatedExecution = await this.prisma.workflowExecution.update({
      where: { id: execution.id },
      data: {
        status: result.status,
        output: result.output as Prisma.InputJsonValue,
        error: result.error,
        nodeResults: result.nodeResults as Prisma.InputJsonValue,
        completedAt: new Date(),
      },
    });

    this.logger.log(`Execution ${execution.id} completed with status: ${result.status}`);

    return updatedExecution as ExecutionResponseDto;
  }

  async findExecutions(
    projectId: string,
    workflowId: string,
    pagination: PaginationDto,
  ): Promise<{
    data: ExecutionResponseDto[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    // Verify workflow exists
    await this.findOne(projectId, workflowId);

    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const where = { workflowId };

    const [data, total] = await Promise.all([
      this.prisma.workflowExecution.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startedAt: 'desc' },
      }),
      this.prisma.workflowExecution.count({ where }),
    ]);

    return {
      data: data as ExecutionResponseDto[],
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
