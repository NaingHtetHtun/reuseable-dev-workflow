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
var CodegenService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodegenService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../shared/database/prisma.service");
const workflow_core_1 = require("@devflow/workflow-core");
let CodegenService = CodegenService_1 = class CodegenService {
    prisma;
    logger = new common_1.Logger(CodegenService_1.name);
    compiler;
    constructor(prisma) {
        this.prisma = prisma;
        this.compiler = new workflow_core_1.Compiler();
        this.compiler.registerAdapter(new workflow_core_1.TypeScriptAdapter());
    }
    async previewProject(projectId, dto) {
        const resources = await this.prisma.resource.findMany({
            where: { projectId },
            orderBy: { name: 'asc' },
        });
        if (resources.length === 0) {
            return {
                success: true,
                files: [],
                warnings: ['No resources found in this project'],
                errors: [],
                metadata: {
                    framework: dto.framework,
                    version: dto.version,
                    resourceCount: 0,
                    componentCount: 0,
                    fileCount: 0,
                    generatedAt: new Date(),
                },
            };
        }
        const definition = this.buildDefinition(projectId, resources);
        return this.compiler.compile(definition, {
            framework: dto.framework,
            version: dto.version,
            outputPrefix: dto.outputPrefix,
            includeComments: dto.includeComments ?? true,
        });
    }
    async previewResource(projectId, resourceId, dto) {
        const resource = await this.prisma.resource.findFirst({
            where: { id: resourceId, projectId },
        });
        if (!resource) {
            throw new common_1.NotFoundException('Resource not found');
        }
        const definition = this.buildDefinition(projectId, [resource]);
        return this.compiler.compile(definition, {
            framework: dto.framework,
            version: dto.version,
            outputPrefix: dto.outputPrefix,
            includeComments: dto.includeComments ?? true,
        });
    }
    getAvailableFrameworks() {
        return this.compiler.getAvailableFrameworks();
    }
    buildDefinition(projectId, resources) {
        return {
            name: projectId,
            resources: resources.map((r) => ({
                name: r.name,
                displayName: r.displayName,
                description: r.description ?? undefined,
                tableName: r.tableName ?? undefined,
                fields: r.fields,
            })),
            components: [],
        };
    }
};
exports.CodegenService = CodegenService;
exports.CodegenService = CodegenService = CodegenService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CodegenService);
//# sourceMappingURL=codegen.service.js.map