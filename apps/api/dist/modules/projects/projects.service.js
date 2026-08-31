'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return (c > 3 && r && Object.defineProperty(target, key, r), r);
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
var ProjectsService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.ProjectsService = void 0;
const common_1 = require('@nestjs/common');
const prisma_service_1 = require('../../shared/database/prisma.service');
let ProjectsService = (ProjectsService_1 = class ProjectsService {
  prisma;
  logger = new common_1.Logger(ProjectsService_1.name);
  constructor(prisma) {
    this.prisma = prisma;
  }
  async create(dto) {
    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description ?? null,
      },
    });
    this.logger.log(`Created project: ${project.id}`);
    return project;
  }
  async findAll(pagination, search) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;
    const where = search ? { name: { contains: search, mode: 'insensitive' } } : {};
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
  async findOne(id) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });
    if (!project) {
      throw new common_1.NotFoundException(`Project not found`);
    }
    return project;
  }
  async update(id, dto) {
    await this.findOne(id);
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
  async remove(id) {
    await this.findOne(id);
    await this.prisma.project.delete({
      where: { id },
    });
    this.logger.log(`Deleted project: ${id}`);
  }
});
exports.ProjectsService = ProjectsService;
exports.ProjectsService =
  ProjectsService =
  ProjectsService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __metadata('design:paramtypes', [prisma_service_1.PrismaService]),
      ],
      ProjectsService,
    );
//# sourceMappingURL=projects.service.js.map
