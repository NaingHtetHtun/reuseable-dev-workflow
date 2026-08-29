import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../shared/database/prisma.service';
import { CreateProjectDto, UpdateProjectDto, ProjectResponseDto } from './dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProjectDto): Promise<ProjectResponseDto> {
    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description ?? null,
      },
    });

    this.logger.log(`Created project: ${project.id}`);
    return project;
  }

  async findAll(
    pagination: PaginationDto,
    search?: string,
  ): Promise<{
    data: ProjectResponseDto[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.ProjectWhereInput = search
      ? { name: { contains: search, mode: 'insensitive' } }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<ProjectResponseDto> {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException(`Project not found`);
    }

    return project;
  }

  async update(id: string, dto: UpdateProjectDto): Promise<ProjectResponseDto> {
    await this.findOne(id); // throws NotFoundException if not found

    const project = await this.prisma.project.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
      },
    });

    this.logger.log(`Updated project: ${project.id}`);
    return project;
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id); // throws NotFoundException if not found

    await this.prisma.project.delete({
      where: { id },
    });

    this.logger.log(`Deleted project: ${id}`);
  }
}
