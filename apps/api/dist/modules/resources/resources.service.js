"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ResourcesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourcesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../shared/database/prisma.service");
const projects_service_1 = require("../projects/projects.service");
const workflow_core_1 = require("@devflow/workflow-core");
let ResourcesService = ResourcesService_1 = class ResourcesService {
    prisma;
    projectsService;
    logger = new common_1.Logger(ResourcesService_1.name);
    validator;
    prismaGenerator;
    validationGenerator;
    constructor(prisma, projectsService) {
        this.prisma = prisma;
        this.projectsService = projectsService;
        this.validator = new workflow_core_1.ResourceValidator();
        this.prismaGenerator = new workflow_core_1.PrismaGenerator();
        this.validationGenerator = new workflow_core_1.ValidationGenerator();
    }
    async create(projectId, dto) {
        await this.projectsService.findOne(projectId);
        const existing = await this.prisma.resource.findFirst({
            where: { projectId, name: dto.name },
        });
        if (existing) {
            throw new common_1.ConflictException(`Resource "${dto.name}" already exists in this project`);
        }
        const validation = this.validator.validateResource({
            name: dto.name,
            displayName: dto.displayName,
            version: '1.0.0',
            status: 'draft',
            fields: dto.fields,
        });
        if (!validation.valid) {
            throw new common_1.BadRequestException(`Invalid resource: ${validation.errors.join('; ')}`);
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
                fields: dto.fields,
            },
        });
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
                },
                changelog: 'Initial version',
            },
        });
        this.logger.log(`Created resource: ${resource.id} (${dto.name})`);
        return this.toResponseDto(resource);
    }
    async findAll(projectId, query) {
        const { page = 1, limit = 20, search, status } = query;
        const skip = (page - 1) * limit;
        const where = {
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
    async findOne(projectId, id) {
        const resource = await this.prisma.resource.findFirst({
            where: { id, projectId },
        });
        if (!resource) {
            throw new common_1.NotFoundException('Resource not found');
        }
        return this.toResponseDto(resource);
    }
    async update(projectId, id, dto) {
        const existing = await this.prisma.resource.findFirst({
            where: { id, projectId },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Resource not found');
        }
        const updated = await this.prisma.resource.update({
            where: { id },
            data: {
                ...(dto.displayName !== undefined && { displayName: dto.displayName }),
                ...(dto.description !== undefined && { description: dto.description }),
                ...(dto.tableName !== undefined && { tableName: dto.tableName }),
                ...(dto.status !== undefined && { status: dto.status }),
                ...(dto.fields !== undefined && {
                    fields: dto.fields,
                }),
            },
        });
        this.logger.log(`Updated resource: ${id}`);
        return this.toResponseDto(updated);
    }
    async remove(projectId, id) {
        const resource = await this.prisma.resource.findFirst({
            where: { id, projectId },
        });
        if (!resource) {
            throw new common_1.NotFoundException('Resource not found');
        }
        await this.prisma.resourceVersion.deleteMany({
            where: { resourceId: id },
        });
        await this.prisma.resource.delete({ where: { id } });
        this.logger.log(`Deleted resource: ${id}`);
    }
    async createVersion(projectId, resourceId, version, changelog) {
        const resource = await this.prisma.resource.findFirst({
            where: { id: resourceId, projectId },
        });
        if (!resource) {
            throw new common_1.NotFoundException('Resource not found');
        }
        if (!this.validator.isValidVersion(version)) {
            throw new common_1.BadRequestException('Version must be in semver format (e.g., 1.0.0)');
        }
        const existingVersion = await this.prisma.resourceVersion.findFirst({
            where: { resourceId, version },
        });
        if (existingVersion) {
            throw new common_1.ConflictException(`Version ${version} already exists`);
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
                },
                changelog,
            },
        });
        await this.prisma.resource.update({
            where: { id: resourceId },
            data: { version },
        });
        this.logger.log(`Created version ${version} for resource ${resourceId}`);
        return {
            id: versionRecord.id,
            resourceId: versionRecord.resourceId,
            version: versionRecord.version,
            definition: versionRecord.definition,
            changelog: versionRecord.changelog ?? undefined,
            createdAt: versionRecord.createdAt,
        };
    }
    async listVersions(projectId, resourceId) {
        const resource = await this.prisma.resource.findFirst({
            where: { id: resourceId, projectId },
        });
        if (!resource) {
            throw new common_1.NotFoundException('Resource not found');
        }
        const versions = await this.prisma.resourceVersion.findMany({
            where: { resourceId },
            orderBy: { createdAt: 'desc' },
        });
        return versions.map((v) => ({
            id: v.id,
            resourceId: v.resourceId,
            version: v.version,
            definition: v.definition,
            changelog: v.changelog ?? undefined,
            createdAt: v.createdAt,
        }));
    }
    async getVersion(projectId, resourceId, version) {
        const resource = await this.prisma.resource.findFirst({
            where: { id: resourceId, projectId },
        });
        if (!resource) {
            throw new common_1.NotFoundException('Resource not found');
        }
        const versionRecord = await this.prisma.resourceVersion.findFirst({
            where: { resourceId, version },
        });
        if (!versionRecord) {
            throw new common_1.NotFoundException(`Version ${version} not found`);
        }
        return {
            id: versionRecord.id,
            resourceId: versionRecord.resourceId,
            version: versionRecord.version,
            definition: versionRecord.definition,
            changelog: versionRecord.changelog ?? undefined,
            createdAt: versionRecord.createdAt,
        };
    }
    async generatePrisma(projectId, resourceId) {
        const resource = await this.prisma.resource.findFirst({
            where: { id: resourceId, projectId },
        });
        if (!resource) {
            throw new common_1.NotFoundException('Resource not found');
        }
        const definition = {
            id: resource.id,
            name: resource.name,
            displayName: resource.displayName,
            description: resource.description ?? undefined,
            version: resource.version,
            status: resource.status,
            projectId: resource.projectId,
            tableName: resource.tableName ?? undefined,
            fields: resource.fields,
            metadata: {
                createdAt: resource.createdAt,
                updatedAt: resource.updatedAt,
                versionCount: 1,
            },
        };
        const prisma = this.prismaGenerator.generateModel(definition);
        return { prisma };
    }
    async generateValidation(projectId, resourceId, operation) {
        const resource = await this.prisma.resource.findFirst({
            where: { id: resourceId, projectId },
        });
        if (!resource) {
            throw new common_1.NotFoundException('Resource not found');
        }
        const definition = {
            id: resource.id,
            name: resource.name,
            displayName: resource.displayName,
            description: resource.description ?? undefined,
            version: resource.version,
            status: resource.status,
            projectId: resource.projectId,
            tableName: resource.tableName ?? undefined,
            fields: resource.fields,
            metadata: {
                createdAt: resource.createdAt,
                updatedAt: resource.updatedAt,
                versionCount: 1,
            },
        };
        const dto = this.validationGenerator.generateDto(definition, operation);
        return { dto };
    }
    toResponseDto(resource) {
        return {
            id: resource.id,
            projectId: resource.projectId,
            name: resource.name,
            displayName: resource.displayName,
            description: resource.description ?? undefined,
            tableName: resource.tableName ?? undefined,
            version: resource.version,
            status: resource.status,
            fields: resource.fields,
            createdAt: resource.createdAt,
            updatedAt: resource.updatedAt,
        };
    }
};
exports.ResourcesService = ResourcesService;
exports.ResourcesService = ResourcesService = ResourcesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        projects_service_1.ProjectsService])
], ResourcesService);
//# sourceMappingURL=resources.service.js.map