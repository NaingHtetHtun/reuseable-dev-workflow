import { PrismaService } from '../../shared/database/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { type ComponentVersion, type ComponentStatus } from '@devflow/workflow-core';
import { CreateComponentDto, UpdateComponentDto, ComponentResponseDto } from './dto';
export declare class ComponentsService {
  private readonly prisma;
  private readonly projectsService;
  private readonly logger;
  private readonly validator;
  constructor(prisma: PrismaService, projectsService: ProjectsService);
  create(projectId: string, dto: CreateComponentDto): Promise<ComponentResponseDto>;
  findAll(
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
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  findOne(projectId: string, id: string): Promise<ComponentResponseDto>;
  update(projectId: string, id: string, dto: UpdateComponentDto): Promise<ComponentResponseDto>;
  remove(projectId: string, id: string): Promise<void>;
  createVersion(
    projectId: string,
    componentId: string,
    version: string,
    changelog?: string,
  ): Promise<ComponentVersion>;
  listVersions(projectId: string, componentId: string): Promise<ComponentVersion[]>;
  getVersion(projectId: string, componentId: string, version: string): Promise<ComponentVersion>;
  clone(projectId: string, componentId: string, newName: string): Promise<ComponentResponseDto>;
  private toResponseDto;
}
