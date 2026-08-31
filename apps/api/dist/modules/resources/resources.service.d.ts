import { PrismaService } from '../../shared/database/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { type ResourceVersion, type ResourceStatus } from '@devflow/workflow-core';
import { CreateResourceDto, UpdateResourceDto, ResourceResponseDto } from './dto';
export declare class ResourcesService {
  private readonly prisma;
  private readonly projectsService;
  private readonly logger;
  private readonly validator;
  private readonly prismaGenerator;
  private readonly validationGenerator;
  constructor(prisma: PrismaService, projectsService: ProjectsService);
  create(projectId: string, dto: CreateResourceDto): Promise<ResourceResponseDto>;
  findAll(
    projectId: string,
    query: {
      page?: number;
      limit?: number;
      search?: string;
      status?: ResourceStatus;
    },
  ): Promise<{
    data: ResourceResponseDto[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  findOne(projectId: string, id: string): Promise<ResourceResponseDto>;
  update(projectId: string, id: string, dto: UpdateResourceDto): Promise<ResourceResponseDto>;
  remove(projectId: string, id: string): Promise<void>;
  createVersion(
    projectId: string,
    resourceId: string,
    version: string,
    changelog?: string,
  ): Promise<ResourceVersion>;
  listVersions(projectId: string, resourceId: string): Promise<ResourceVersion[]>;
  getVersion(projectId: string, resourceId: string, version: string): Promise<ResourceVersion>;
  generatePrisma(
    projectId: string,
    resourceId: string,
  ): Promise<{
    prisma: string;
  }>;
  generateValidation(
    projectId: string,
    resourceId: string,
    operation: 'create' | 'update' | 'response',
  ): Promise<{
    dto: string;
  }>;
  private toResponseDto;
}
