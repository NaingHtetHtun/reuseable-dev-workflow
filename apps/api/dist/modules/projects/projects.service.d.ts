import { PrismaService } from '../../shared/database/prisma.service';
import { CreateProjectDto, UpdateProjectDto, ProjectResponseDto } from './dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
export declare class ProjectsService {
  private readonly prisma;
  private readonly logger;
  constructor(prisma: PrismaService);
  create(dto: CreateProjectDto): Promise<ProjectResponseDto>;
  findAll(
    pagination: PaginationDto,
    search?: string,
  ): Promise<{
    data: ProjectResponseDto[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  findOne(id: string): Promise<ProjectResponseDto>;
  update(id: string, dto: UpdateProjectDto): Promise<ProjectResponseDto>;
  remove(id: string): Promise<void>;
}
