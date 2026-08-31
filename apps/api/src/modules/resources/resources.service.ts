import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../shared/database/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import {
  ResourceValidator,
  PrismaGenerator,
  ValidationGenerator,
  type ResourceDefinition,
  type ResourceVersion,
  type ResourceStatus,
} from '@devflow/workflow-core';
import { CreateResourceDto, UpdateResourceDto, ResourceResponseDto } from './dto';

@Injectable()
export class ResourcesService {
  private readonly logger = new Logger(ResourcesService.name);
  private readonly validator: ResourceValidator;
  private readonly prismaGenerator: PrismaGenerator;
  private readonly validationGenerator: ValidationGenerator;

  constructor(
    private readonly prisma: PrismaService,
    private readonly projectsService: ProjectsService,
  ) {
    this.validator = new ResourceValidator();
    this.prismaGenerator = new PrismaGenerator();
    this.validationGenerator = new ValidationGenerator();
  }

  /**
   * Create a new resource definition.
   */
  async create(projectId: string, dto: CreateResourceDto): Promise<ResourceResponseDto> {
    // Verify project exists
    await this.projectsService.findOne(projectId);

    // Check for name uniqueness within project
    const existing = await this.prisma.resource.findFirst({
      where: { projectId, name: dto.name },
    });
    if (existing) {
      throw new ConflictException(`Resource "${dto.name}" already exists in this project`);
    }

    // Validate resource definition
    const validation = this.validator.validateResource({
      name: dto.name,
      displayName: dto.displayName,
      version: '1.0.0',
      status: 'draft',
      fields: dto.fields as unknown as ResourceDefinition['fields'],
    });

    if (!validation.valid) {
      throw new BadRequestException(`Invalid resource: ${validation.errors.join('; ')}`);
    }

    const resource = await this.prisma.resource.create({
      data: {
        projectId,
        name: dto.name,
        displayName: dto.displayName,
        description: dto.description,
        tableName: dto.tableName,
        version: '1.0.0',
        status: 'draft',
        fields: dto.fields as unknown as Prisma.InputJsonValue,
      },
    });

    // Create initial version
    await this.prisma.resourceVersion.create({
      data: {
        resourceId: resource.id,
        version: '1.0.0',
        definition: {
          name: resource.name,
          displayName: resource.displayName,
          description: resource.description,
          version: resource.version,
          status: resource.status,
          projectId: resource.projectId,
          tableName: resource.tableName,
          fields: resource.fields,
        } as unknown as Prisma.InputJsonValue,
        changelog: 'Initial version',
      },
    });

    this.logger.log(`Created resource: ${resource.id} (${dto.name})`);
    return this.toResponseDto(resource);
  }

  /**
   * List resources for a project with filtering and pagination.
   */
  async findAll(
    projectId: string,
    query: {
      page?: number;
      limit?: number;
      search?: string;
      status?: ResourceStatus;
    },
  ): Promise<{
    data: ResourceResponseDto[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const { page = 1, limit = 20, search, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ResourceWhereInput = {
      projectId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { displayName: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(status && { status }),
    };

    const [data, total] = await Promise.all([
      this.prisma.resource.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.resource.count({ where }),
    ]);

    return {
      data: data.map((r) => this.toResponseDto(r)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single resource by ID.
   */
  async findOne(projectId: string, id: string): Promise<ResourceResponseDto> {
    const resource = await this.prisma.resource.findFirst({
      where: { id, projectId },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    return this.toResponseDto(resource);
  }

  /**
   * Update a resource definition.
   */
  async update(
    projectId: string,
    id: string,
    dto: UpdateResourceDto,
  ): Promise<ResourceResponseDto> {
    const existing = await this.prisma.resource.findFirst({
      where: { id, projectId },
    });

    if (!existing) {
      throw new NotFoundException('Resource not found');
    }

    const updated = await this.prisma.resource.update({
      where: { id },
      data: {
        ...(dto.displayName !== undefined && { displayName: dto.displayName }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.tableName !== undefined && { tableName: dto.tableName }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.fields !== undefined && {
          fields: dto.fields as unknown as Prisma.InputJsonValue,
        }),
      },
    });

    this.logger.log(`Updated resource: ${id}`);
    return this.toResponseDto(updated);
  }

  /**
   * Delete a resource and its versions.
   */
  async remove(projectId: string, id: string): Promise<void> {
    const resource = await this.prisma.resource.findFirst({
      where: { id, projectId },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    await this.prisma.resourceVersion.deleteMany({
      where: { resourceId: id },
    });

    await this.prisma.resource.delete({ where: { id } });
    this.logger.log(`Deleted resource: ${id}`);
  }

  /**
   * Create a new version of a resource.
   */
  async createVersion(
    projectId: string,
    resourceId: string,
    version: string,
    changelog?: string,
  ): Promise<ResourceVersion> {
    const resource = await this.prisma.resource.findFirst({
      where: { id: resourceId, projectId },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    if (!this.validator.isValidVersion(version)) {
      throw new BadRequestException('Version must be in semver format (e.g., 1.0.0)');
    }

    const existingVersion = await this.prisma.resourceVersion.findFirst({
      where: { resourceId, version },
    });
    if (existingVersion) {
      throw new ConflictException(`Version ${version} already exists`);
    }

    const versionRecord = await this.prisma.resourceVersion.create({
      data: {
        resourceId,
        version,
        definition: {
          name: resource.name,
          displayName: resource.displayName,
          description: resource.description,
          version: resource.version,
          status: resource.status,
          projectId: resource.projectId,
          tableName: resource.tableName,
          fields: resource.fields,
        } as unknown as Prisma.InputJsonValue,
        changelog,
      },
    });

    // Update resource version
    await this.prisma.resource.update({
      where: { id: resourceId },
      data: { version },
    });

    this.logger.log(`Created version ${version} for resource ${resourceId}`);
    return {
      id: versionRecord.id,
      resourceId: versionRecord.resourceId,
      version: versionRecord.version,
      definition: versionRecord.definition as unknown as ResourceDefinition,
      changelog: versionRecord.changelog ?? undefined,
      createdAt: versionRecord.createdAt,
    };
  }

  /**
   * List versions for a resource.
   */
  async listVersions(projectId: string, resourceId: string): Promise<ResourceVersion[]> {
    const resource = await this.prisma.resource.findFirst({
      where: { id: resourceId, projectId },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    const versions = await this.prisma.resourceVersion.findMany({
      where: { resourceId },
      orderBy: { createdAt: 'desc' },
    });

    return versions.map((v) => ({
      id: v.id,
      resourceId: v.resourceId,
      version: v.version,
      definition: v.definition as unknown as ResourceDefinition,
      changelog: v.changelog ?? undefined,
      createdAt: v.createdAt,
    }));
  }

  /**
   * Get a specific version.
   */
  async getVersion(
    projectId: string,
    resourceId: string,
    version: string,
  ): Promise<ResourceVersion> {
    const resource = await this.prisma.resource.findFirst({
      where: { id: resourceId, projectId },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    const versionRecord = await this.prisma.resourceVersion.findFirst({
      where: { resourceId, version },
    });

    if (!versionRecord) {
      throw new NotFoundException(`Version ${version} not found`);
    }

    return {
      id: versionRecord.id,
      resourceId: versionRecord.resourceId,
      version: versionRecord.version,
      definition: versionRecord.definition as unknown as ResourceDefinition,
      changelog: versionRecord.changelog ?? undefined,
      createdAt: versionRecord.createdAt,
    };
  }

  /**
   * Preview generated Prisma model for a resource.
   */
  async generatePrisma(projectId: string, resourceId: string): Promise<{ prisma: string }> {
    const resource = await this.prisma.resource.findFirst({
      where: { id: resourceId, projectId },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    const definition: ResourceDefinition = {
      id: resource.id,
      name: resource.name,
      displayName: resource.displayName,
      description: resource.description ?? undefined,
      version: resource.version,
      status: resource.status as ResourceStatus,
      projectId: resource.projectId,
      tableName: resource.tableName ?? undefined,
      fields: resource.fields as unknown as ResourceDefinition['fields'],
      metadata: {
        createdAt: resource.createdAt,
        updatedAt: resource.updatedAt,
        versionCount: 1,
      },
    };

    const prisma = this.prismaGenerator.generateModel(definition);
    return { prisma };
  }

  /**
   * Preview generated validation DTO for a resource.
   */
  async generateValidation(
    projectId: string,
    resourceId: string,
    operation: 'create' | 'update' | 'response',
  ): Promise<{ dto: string }> {
    const resource = await this.prisma.resource.findFirst({
      where: { id: resourceId, projectId },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    const definition: ResourceDefinition = {
      id: resource.id,
      name: resource.name,
      displayName: resource.displayName,
      description: resource.description ?? undefined,
      version: resource.version,
      status: resource.status as ResourceStatus,
      projectId: resource.projectId,
      tableName: resource.tableName ?? undefined,
      fields: resource.fields as unknown as ResourceDefinition['fields'],
      metadata: {
        createdAt: resource.createdAt,
        updatedAt: resource.updatedAt,
        versionCount: 1,
      },
    };

    const dto = this.validationGenerator.generateDto(definition, operation);
    return { dto };
  }

  /**
   * Convert Prisma resource to response DTO.
   */
  private toResponseDto(resource: {
    id: string;
    projectId: string;
    name: string;
    displayName: string;
    description: string | null;
    tableName: string | null;
    version: string;
    status: string;
    fields: unknown;
    createdAt: Date;
    updatedAt: Date;
  }): ResourceResponseDto {
    return {
      id: resource.id,
      projectId: resource.projectId,
      name: resource.name,
      displayName: resource.displayName,
      description: resource.description ?? undefined,
      tableName: resource.tableName ?? undefined,
      version: resource.version,
      status: resource.status as ResourceStatus,
      fields: resource.fields as Record<string, unknown>[],
      createdAt: resource.createdAt,
      updatedAt: resource.updatedAt,
    };
  }
}
