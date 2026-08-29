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
var WorkflowsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../shared/database/prisma.service");
const projects_service_1 = require("../projects/projects.service");
const workflow_core_1 = require("@devflow/workflow-core");
let WorkflowsService = WorkflowsService_1 = class WorkflowsService {
    prisma;
    projectsService;
    logger = new common_1.Logger(WorkflowsService_1.name);
    executor = new workflow_core_1.WorkflowExecutor({
        log: (msg) => this.logger.log(msg),
        error: (msg, stack) => this.logger.error(msg, stack),
        warn: (msg) => this.logger.warn(msg),
    });
    constructor(prisma, projectsService) {
        this.prisma = prisma;
        this.projectsService = projectsService;
    }
    async create(projectId, dto) {
        await this.projectsService.findOne(projectId);
        const validation = (0, workflow_core_1.validateWorkflowDefinition)(dto.definition);
        if (!validation.valid) {
            throw new common_1.BadRequestException(`Invalid workflow definition: ${validation.errors.join('; ')}`);
        }
        const workflow = await this.prisma.workflow.create({
            data: {
                projectId,
                name: dto.name,
                description: dto.description ?? null,
                definition: dto.definition,
            },
        });
        this.logger.log(`Created workflow: ${workflow.id}`);
        return workflow;
    }
    async findAll(projectId, query) {
        const { page = 1, limit = 20, search, status } = query;
        const skip = (page - 1) * limit;
        const where = {
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
            data: data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(projectId, id) {
        const workflow = await this.prisma.workflow.findFirst({
            where: { id, projectId },
        });
        if (!workflow) {
            throw new common_1.NotFoundException('Workflow not found');
        }
        return workflow;
    }
    async update(projectId, id, dto) {
        await this.findOne(projectId, id);
        if (dto.definition) {
            const validation = (0, workflow_core_1.validateWorkflowDefinition)(dto.definition);
            if (!validation.valid) {
                throw new common_1.BadRequestException(`Invalid workflow definition: ${validation.errors.join('; ')}`);
            }
        }
        const workflow = await this.prisma.workflow.update({
            where: { id },
            data: {
                ...(dto.name !== undefined && { name: dto.name }),
                ...(dto.description !== undefined && { description: dto.description }),
                ...(dto.status !== undefined && { status: dto.status }),
                ...(dto.definition !== undefined && {
                    definition: dto.definition,
                }),
                version: { increment: 1 },
            },
        });
        this.logger.log(`Updated workflow: ${workflow.id} (v${workflow.version})`);
        return workflow;
    }
    async remove(projectId, id) {
        await this.findOne(projectId, id);
        await this.prisma.workflow.delete({ where: { id } });
        this.logger.log(`Deleted workflow: ${id}`);
    }
    async execute(projectId, id, dto) {
        const workflow = await this.findOne(projectId, id);
        const execution = await this.prisma.workflowExecution.create({
            data: {
                workflowId: id,
                status: 'running',
                input: dto.input ?? null,
            },
        });
        this.logger.log(`Started execution: ${execution.id} for workflow: ${id}`);
        const result = await this.executor.execute(workflow.id, execution.id, workflow.definition, dto.input ?? null);
        const updatedExecution = await this.prisma.workflowExecution.update({
            where: { id: execution.id },
            data: {
                status: result.status,
                output: result.output,
                error: result.error,
                nodeResults: result.nodeResults,
                completedAt: new Date(),
            },
        });
        this.logger.log(`Execution ${execution.id} completed with status: ${result.status}`);
        return updatedExecution;
    }
    async findExecutions(projectId, workflowId, pagination) {
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
            data: data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
};
exports.WorkflowsService = WorkflowsService;
exports.WorkflowsService = WorkflowsService = WorkflowsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        projects_service_1.ProjectsService])
], WorkflowsService);
//# sourceMappingURL=workflows.service.js.map