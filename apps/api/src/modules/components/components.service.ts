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
  ComponentValidator,
  type ComponentDefinition,
  type ComponentVersion,
  type ComponentStatus,
} from '@devflow/workflow-core';
import { CreateComponentDto, UpdateComponentDto, ComponentResponseDto } from './dto';

@Injectable()
export class ComponentsService {
  private readonly logger = new Logger(ComponentsService.name);
  private readonly validator: ComponentValidator;

  constructor(
    private readonly prisma: PrismaService,
    private readonly projectsService: ProjectsService,
  ) {
    this.validator = new ComponentValidator();
  }

  /**
   * Create a new component.
   */
  async create(projectId: string, dto: CreateComponentDto): Promise<ComponentResponseDto> {
    // Verify project exists
    await this.projectsService.findOne(projectId);

    // Check for name uniqueness within project
    const existing = await this.prisma.component.findFirst({
      where: { projectId, name: dto.name },
    });
    if (existing) {
      throw new ConflictException(`Component "${dto.name}" already exists in this project`);
    }

    // Validate component
    const validation = this.validator.validateComponent({
      name: dto.name,
      displayName: dto.displayName,
      version: '1.0.0',
      status: 'draft',
      configSchema: dto.configSchema as unknown as ComponentDefinition['configSchema'],
      credentialSchema: dto.credentialSchema as unknown as ComponentDefinition['credentialSchema'],
      inputSchema: dto.inputSchema as unknown as ComponentDefinition['inputSchema'],
      outputSchema: dto.outputSchema as unknown as ComponentDefinition['outputSchema'],
      implementation: dto.implementation as unknown as ComponentDefinition['implementation'],
    });

    if (!validation.valid) {
      throw new BadRequestException(`Invalid component: ${validation.errors.join('; ')}`);
    }

    const component = await this.prisma.component.create({
      data: {
        projectId,
        name: dto.name,
        displayName: dto.displayName,
        description: dto.description,
        version: '1.0.0',
        status: 'draft',
        category: dto.category,
        tags: dto.tags ?? [],
        author: dto.author,
        configSchema: (dto.configSchema as Prisma.InputJsonValue) ?? {
          type: 'object',
          properties: {},
        },
        credentialSchema: (dto.credentialSchema as Prisma.InputJsonValue) ?? { required: [] },
        inputSchema: (dto.inputSchema as Prisma.InputJsonValue) ?? {
          type: 'object',
          properties: {},
        },
        outputSchema: (dto.outputSchema as Prisma.InputJsonValue) ?? {
          type: 'object',
          properties: {},
        },
        implementation: (dto.implementation as Prisma.InputJsonValue) ?? { type: 'workflow' },
      },
    });

    // Create initial version
    await this.prisma.componentVersion.create({
      data: {
        componentId: component.id,
        version: '1.0.0',
        definition: {
          name: component.name,
          displayName: component.displayName,
          description: component.description,
          version: component.version,
          status: component.status,
          category: component.category,
          tags: component.tags,
          author: component.author,
          configSchema: component.configSchema,
          credentialSchema: component.credentialSchema,
          inputSchema: component.inputSchema,
          outputSchema: component.outputSchema,
          implementation: component.implementation,
        } as unknown as Prisma.InputJsonValue,
        changelog: 'Initial version',
      },
    });

    this.logger.log(`Created component: ${component.id} (${dto.name})`);
    return this.toResponseDto(component);
  }

  /**
   * List components for a project with filtering and pagination.
   */
  async findAll(
    projectId: string,
    query: {
      page?: number;
      limit?: number;
      search?: string;
      category?: string;
      status?: ComponentStatus;
      tags?: string[];
    },
  ): Promise<{
    data: ComponentResponseDto[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const { page = 1, limit = 20, search, category, status, tags } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ComponentWhereInput = {
      projectId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { displayName: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(category && { category }),
      ...(status && { status }),
      ...(tags && tags.length > 0 && { tags: { hasSome: tags } }),
    };

    const [data, total] = await Promise.all([
      this.prisma.component.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.component.count({ where }),
    ]);

    return {
      data: data.map((c) => this.toResponseDto(c)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single component by ID.
   */
  async findOne(projectId: string, id: string): Promise<ComponentResponseDto> {
    const component = await this.prisma.component.findFirst({
      where: { id, projectId },
    });

    if (!component) {
      throw new NotFoundException('Component not found');
    }

    return this.toResponseDto(component);
  }

  /**
   * Update a component.
   */
  async update(
    projectId: string,
    id: string,
    dto: UpdateComponentDto,
  ): Promise<ComponentResponseDto> {
    const existing = await this.prisma.component.findFirst({
      where: { id, projectId },
    });

    if (!existing) {
      throw new NotFoundException('Component not found');
    }

    const updated = await this.prisma.component.update({
      where: { id },
      data: {
        ...(dto.displayName !== undefined && { displayName: dto.displayName }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.tags !== undefined && { tags: dto.tags }),
        ...(dto.author !== undefined && { author: dto.author }),
        ...(dto.configSchema !== undefined && {
          configSchema: dto.configSchema as Prisma.InputJsonValue,
        }),
        ...(dto.credentialSchema !== undefined && {
          credentialSchema: dto.credentialSchema as Prisma.InputJsonValue,
        }),
        ...(dto.inputSchema !== undefined && {
          inputSchema: dto.inputSchema as Prisma.InputJsonValue,
        }),
        ...(dto.outputSchema !== undefined && {
          outputSchema: dto.outputSchema as Prisma.InputJsonValue,
        }),
        ...(dto.implementation !== undefined && {
          implementation: dto.implementation as Prisma.InputJsonValue,
        }),
      },
    });

    this.logger.log(`Updated component: ${id}`);
    return this.toResponseDto(updated);
  }

  /**
   * Delete a component and its versions.
   */
  async remove(projectId: string, id: string): Promise<void> {
    const component = await this.prisma.component.findFirst({
      where: { id, projectId },
    });

    if (!component) {
      throw new NotFoundException('Component not found');
    }

    // Delete versions first
    await this.prisma.componentVersion.deleteMany({
      where: { componentId: id },
    });

    await this.prisma.component.delete({ where: { id } });
    this.logger.log(`Deleted component: ${id}`);
  }

  /**
   * Create a new version of a component.
   */
  async createVersion(
    projectId: string,
    componentId: string,
    version: string,
    changelog?: string,
  ): Promise<ComponentVersion> {
    const component = await this.prisma.component.findFirst({
      where: { id: componentId, projectId },
    });

    if (!component) {
      throw new NotFoundException('Component not found');
    }

    // Validate version format
    if (!this.validator.isValidVersion(version)) {
      throw new BadRequestException('Version must be in semver format (e.g., 1.0.0)');
    }

    // Check version uniqueness
    const existingVersion = await this.prisma.componentVersion.findFirst({
      where: { componentId, version },
    });
    if (existingVersion) {
      throw new ConflictException(`Version ${version} already exists`);
    }

    const versionRecord = await this.prisma.componentVersion.create({
      data: {
        componentId,
        version,
        definition: {
          name: component.name,
          displayName: component.displayName,
          description: component.description,
          version: component.version,
          status: component.status,
          category: component.category,
          tags: component.tags,
          author: component.author,
          configSchema: component.configSchema,
          credentialSchema: component.credentialSchema,
          inputSchema: component.inputSchema,
          outputSchema: component.outputSchema,
          implementation: component.implementation,
        } as unknown as Prisma.InputJsonValue,
        changelog,
      },
    });

    // Update component version
    await this.prisma.component.update({
      where: { id: componentId },
      data: { version },
    });

    this.logger.log(`Created version ${version} for component ${componentId}`);
    return {
      id: versionRecord.id,
      componentId: versionRecord.componentId,
      version: versionRecord.version,
      definition: versionRecord.definition as unknown as ComponentDefinition,
      changelog: versionRecord.changelog ?? undefined,
      createdAt: versionRecord.createdAt,
    };
  }

  /**
   * List versions for a component.
   */
  async listVersions(projectId: string, componentId: string): Promise<ComponentVersion[]> {
    const component = await this.prisma.component.findFirst({
      where: { id: componentId, projectId },
    });

    if (!component) {
      throw new NotFoundException('Component not found');
    }

    const versions = await this.prisma.componentVersion.findMany({
      where: { componentId },
      orderBy: { createdAt: 'desc' },
    });

    return versions.map((v) => ({
      id: v.id,
      componentId: v.componentId,
      version: v.version,
      definition: v.definition as unknown as ComponentDefinition,
      changelog: v.changelog ?? undefined,
      createdAt: v.createdAt,
    }));
  }

  /**
   * Get a specific version.
   */
  async getVersion(
    projectId: string,
    componentId: string,
    version: string,
  ): Promise<ComponentVersion> {
    const component = await this.prisma.component.findFirst({
      where: { id: componentId, projectId },
    });

    if (!component) {
      throw new NotFoundException('Component not found');
    }

    const versionRecord = await this.prisma.componentVersion.findFirst({
      where: { componentId, version },
    });

    if (!versionRecord) {
      throw new NotFoundException(`Version ${version} not found`);
    }

    return {
      id: versionRecord.id,
      componentId: versionRecord.componentId,
      version: versionRecord.version,
      definition: versionRecord.definition as unknown as ComponentDefinition,
      changelog: versionRecord.changelog ?? undefined,
      createdAt: versionRecord.createdAt,
    };
  }

  /**
   * Clone a component within the same project.
   */
  async clone(
    projectId: string,
    componentId: string,
    newName: string,
  ): Promise<ComponentResponseDto> {
    const original = await this.prisma.component.findFirst({
      where: { id: componentId, projectId },
    });

    if (!original) {
      throw new NotFoundException('Component not found');
    }

    // Check name uniqueness
    const existing = await this.prisma.component.findFirst({
      where: { projectId, name: newName },
    });
    if (existing) {
      throw new ConflictException(`Component "${newName}" already exists in this project`);
    }

    const cloned = await this.prisma.component.create({
      data: {
        projectId,
        name: newName,
        displayName: `${original.displayName} (Clone)`,
        description: original.description,
        version: '1.0.0',
        status: 'draft',
        category: original.category,
        tags: original.tags,
        author: original.author,
        configSchema: original.configSchema as unknown as Prisma.InputJsonValue,
        credentialSchema: original.credentialSchema as unknown as Prisma.InputJsonValue,
        inputSchema: original.inputSchema as unknown as Prisma.InputJsonValue,
        outputSchema: original.outputSchema as unknown as Prisma.InputJsonValue,
        implementation: original.implementation as unknown as Prisma.InputJsonValue,
      },
    });

    // Create initial version for clone
    await this.prisma.componentVersion.create({
      data: {
        componentId: cloned.id,
        version: '1.0.0',
        definition: {
          name: cloned.name,
          displayName: cloned.displayName,
          description: cloned.description,
          version: cloned.version,
          status: cloned.status,
          category: cloned.category,
          tags: cloned.tags,
          author: cloned.author,
          configSchema: cloned.configSchema,
          credentialSchema: cloned.credentialSchema,
          inputSchema: cloned.inputSchema,
          outputSchema: cloned.outputSchema,
          implementation: cloned.implementation,
        } as unknown as Prisma.InputJsonValue,
        changelog: `Cloned from ${original.name}`,
      },
    });

    this.logger.log(`Cloned component ${componentId} to ${cloned.id} (${newName})`);
    return this.toResponseDto(cloned);
  }

  /**
   * Convert Prisma component to response DTO.
   */
  private toResponseDto(component: {
    id: string;
    projectId: string;
    name: string;
    displayName: string;
    description: string | null;
    version: string;
    status: string;
    category: string | null;
    tags: string[];
    author: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): ComponentResponseDto {
    return {
      id: component.id,
      projectId: component.projectId,
      name: component.name,
      displayName: component.displayName,
      description: component.description ?? undefined,
      version: component.version,
      status: component.status as ComponentStatus,
      category: component.category ?? undefined,
      tags: component.tags,
      author: component.author ?? undefined,
      createdAt: component.createdAt,
      updatedAt: component.updatedAt,
    };
  }
}
