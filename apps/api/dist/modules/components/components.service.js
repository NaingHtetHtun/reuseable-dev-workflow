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
var ComponentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../shared/database/prisma.service");
const projects_service_1 = require("../projects/projects.service");
const workflow_core_1 = require("@devflow/workflow-core");
let ComponentsService = ComponentsService_1 = class ComponentsService {
    prisma;
    projectsService;
    logger = new common_1.Logger(ComponentsService_1.name);
    validator;
    constructor(prisma, projectsService) {
        this.prisma = prisma;
        this.projectsService = projectsService;
        this.validator = new workflow_core_1.ComponentValidator();
    }
    async create(projectId, dto) {
        await this.projectsService.findOne(projectId);
        const existing = await this.prisma.component.findFirst({
            where: { projectId, name: dto.name },
        });
        if (existing) {
            throw new common_1.ConflictException(`Component "${dto.name}" already exists in this project`);
        }
        const validation = this.validator.validateComponent({
            name: dto.name,
            displayName: dto.displayName,
            version: '1.0.0',
            status: 'draft',
            configSchema: dto.configSchema,
            credentialSchema: dto.credentialSchema,
            inputSchema: dto.inputSchema,
            outputSchema: dto.outputSchema,
            implementation: dto.implementation,
        });
        if (!validation.valid) {
            throw new common_1.BadRequestException(`Invalid component: ${validation.errors.join('; ')}`);
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
                configSchema: dto.configSchema ?? {
                    type: 'object',
                    properties: {},
                },
                credentialSchema: dto.credentialSchema ?? { required: [] },
                inputSchema: dto.inputSchema ?? {
                    type: 'object',
                    properties: {},
                },
                outputSchema: dto.outputSchema ?? {
                    type: 'object',
                    properties: {},
                },
                implementation: dto.implementation ?? { type: 'workflow' },
            },
        });
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
                },
                changelog: 'Initial version',
            },
        });
        this.logger.log(`Created component: ${component.id} (${dto.name})`);
        return this.toResponseDto(component);
    }
    async findAll(projectId, query) {
        const { page = 1, limit = 20, search, category, status, tags } = query;
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
    async findOne(projectId, id) {
        const component = await this.prisma.component.findFirst({
            where: { id, projectId },
        });
        if (!component) {
            throw new common_1.NotFoundException('Component not found');
        }
        return this.toResponseDto(component);
    }
    async update(projectId, id, dto) {
        const existing = await this.prisma.component.findFirst({
            where: { id, projectId },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Component not found');
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
                    configSchema: dto.configSchema,
                }),
                ...(dto.credentialSchema !== undefined && {
                    credentialSchema: dto.credentialSchema,
                }),
                ...(dto.inputSchema !== undefined && {
                    inputSchema: dto.inputSchema,
                }),
                ...(dto.outputSchema !== undefined && {
                    outputSchema: dto.outputSchema,
                }),
                ...(dto.implementation !== undefined && {
                    implementation: dto.implementation,
                }),
            },
        });
        this.logger.log(`Updated component: ${id}`);
        return this.toResponseDto(updated);
    }
    async remove(projectId, id) {
        const component = await this.prisma.component.findFirst({
            where: { id, projectId },
        });
        if (!component) {
            throw new common_1.NotFoundException('Component not found');
        }
        await this.prisma.componentVersion.deleteMany({
            where: { componentId: id },
        });
        await this.prisma.component.delete({ where: { id } });
        this.logger.log(`Deleted component: ${id}`);
    }
    async createVersion(projectId, componentId, version, changelog) {
        const component = await this.prisma.component.findFirst({
            where: { id: componentId, projectId },
        });
        if (!component) {
            throw new common_1.NotFoundException('Component not found');
        }
        if (!this.validator.isValidVersion(version)) {
            throw new common_1.BadRequestException('Version must be in semver format (e.g., 1.0.0)');
        }
        const existingVersion = await this.prisma.componentVersion.findFirst({
            where: { componentId, version },
        });
        if (existingVersion) {
            throw new common_1.ConflictException(`Version ${version} already exists`);
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
                },
                changelog,
            },
        });
        await this.prisma.component.update({
            where: { id: componentId },
            data: { version },
        });
        this.logger.log(`Created version ${version} for component ${componentId}`);
        return {
            id: versionRecord.id,
            componentId: versionRecord.componentId,
            version: versionRecord.version,
            definition: versionRecord.definition,
            changelog: versionRecord.changelog ?? undefined,
            createdAt: versionRecord.createdAt,
        };
    }
    async listVersions(projectId, componentId) {
        const component = await this.prisma.component.findFirst({
            where: { id: componentId, projectId },
        });
        if (!component) {
            throw new common_1.NotFoundException('Component not found');
        }
        const versions = await this.prisma.componentVersion.findMany({
            where: { componentId },
            orderBy: { createdAt: 'desc' },
        });
        return versions.map((v) => ({
            id: v.id,
            componentId: v.componentId,
            version: v.version,
            definition: v.definition,
            changelog: v.changelog ?? undefined,
            createdAt: v.createdAt,
        }));
    }
    async getVersion(projectId, componentId, version) {
        const component = await this.prisma.component.findFirst({
            where: { id: componentId, projectId },
        });
        if (!component) {
            throw new common_1.NotFoundException('Component not found');
        }
        const versionRecord = await this.prisma.componentVersion.findFirst({
            where: { componentId, version },
        });
        if (!versionRecord) {
            throw new common_1.NotFoundException(`Version ${version} not found`);
        }
        return {
            id: versionRecord.id,
            componentId: versionRecord.componentId,
            version: versionRecord.version,
            definition: versionRecord.definition,
            changelog: versionRecord.changelog ?? undefined,
            createdAt: versionRecord.createdAt,
        };
    }
    async clone(projectId, componentId, newName) {
        const original = await this.prisma.component.findFirst({
            where: { id: componentId, projectId },
        });
        if (!original) {
            throw new common_1.NotFoundException('Component not found');
        }
        const existing = await this.prisma.component.findFirst({
            where: { projectId, name: newName },
        });
        if (existing) {
            throw new common_1.ConflictException(`Component "${newName}" already exists in this project`);
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
                configSchema: original.configSchema,
                credentialSchema: original.credentialSchema,
                inputSchema: original.inputSchema,
                outputSchema: original.outputSchema,
                implementation: original.implementation,
            },
        });
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
                },
                changelog: `Cloned from ${original.name}`,
            },
        });
        this.logger.log(`Cloned component ${componentId} to ${cloned.id} (${newName})`);
        return this.toResponseDto(cloned);
    }
    toResponseDto(component) {
        return {
            id: component.id,
            projectId: component.projectId,
            name: component.name,
            displayName: component.displayName,
            description: component.description ?? undefined,
            version: component.version,
            status: component.status,
            category: component.category ?? undefined,
            tags: component.tags,
            author: component.author ?? undefined,
            createdAt: component.createdAt,
            updatedAt: component.updatedAt,
        };
    }
};
exports.ComponentsService = ComponentsService;
exports.ComponentsService = ComponentsService = ComponentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        projects_service_1.ProjectsService])
], ComponentsService);
//# sourceMappingURL=components.service.js.map