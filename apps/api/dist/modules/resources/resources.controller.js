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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourcesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const resources_service_1 = require("./resources.service");
const dto_1 = require("./dto");
let ResourcesController = class ResourcesController {
    resourcesService;
    constructor(resourcesService) {
        this.resourcesService = resourcesService;
    }
    async create(projectId, dto) {
        return this.resourcesService.create(projectId, dto);
    }
    async findAll(projectId, page, limit, search, status) {
        return this.resourcesService.findAll(projectId, {
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
            search,
            status,
        });
    }
    async findOne(projectId, id) {
        return this.resourcesService.findOne(projectId, id);
    }
    async update(projectId, id, dto) {
        return this.resourcesService.update(projectId, id, dto);
    }
    async remove(projectId, id) {
        await this.resourcesService.remove(projectId, id);
    }
    async createVersion(projectId, id, body) {
        return this.resourcesService.createVersion(projectId, id, body.version, body.changelog);
    }
    async listVersions(projectId, id) {
        return this.resourcesService.listVersions(projectId, id);
    }
    async getVersion(projectId, id, version) {
        return this.resourcesService.getVersion(projectId, id, version);
    }
    async generatePrisma(projectId, id) {
        return this.resourcesService.generatePrisma(projectId, id);
    }
    async generateValidation(projectId, id, body) {
        return this.resourcesService.generateValidation(projectId, id, body.operation);
    }
};
exports.ResourcesController = ResourcesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new resource definition' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Resource created' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Name already exists' }),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreateResourceDto]),
    __metadata("design:returntype", Promise)
], ResourcesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List resource definitions' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of resources' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['draft', 'published', 'deprecated'] }),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ResourcesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a resource definition' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Resource details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Not found' }),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ResourcesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a resource definition' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Resource updated' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Not found' }),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.UpdateResourceDto]),
    __metadata("design:returntype", Promise)
], ResourcesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a resource definition' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Deleted' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Not found' }),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ResourcesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/versions'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new version' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Version created' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Version already exists' }),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ResourcesController.prototype, "createVersion", null);
__decorate([
    (0, common_1.Get)(':id/versions'),
    (0, swagger_1.ApiOperation)({ summary: 'List versions' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of versions' }),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ResourcesController.prototype, "listVersions", null);
__decorate([
    (0, common_1.Get)(':id/versions/:version'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific version' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Version details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Not found' }),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('version')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ResourcesController.prototype, "getVersion", null);
__decorate([
    (0, common_1.Post)(':id/generate/prisma'),
    (0, swagger_1.ApiOperation)({ summary: 'Preview generated Prisma model' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Generated Prisma model' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Not found' }),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ResourcesController.prototype, "generatePrisma", null);
__decorate([
    (0, common_1.Post)(':id/generate/validation'),
    (0, swagger_1.ApiOperation)({ summary: 'Preview generated validation DTO' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Generated validation DTO' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Not found' }),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ResourcesController.prototype, "generateValidation", null);
exports.ResourcesController = ResourcesController = __decorate([
    (0, swagger_1.ApiTags)('resources'),
    (0, common_1.Controller)('api/v1/projects/:projectId/resources'),
    __metadata("design:paramtypes", [resources_service_1.ResourcesService])
], ResourcesController);
//# sourceMappingURL=resources.controller.js.map