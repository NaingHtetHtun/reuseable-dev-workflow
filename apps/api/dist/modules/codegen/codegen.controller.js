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
exports.CodegenController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const codegen_service_1 = require("./codegen.service");
const dto_1 = require("./dto");
let CodegenController = class CodegenController {
    codegenService;
    constructor(codegenService) {
        this.codegenService = codegenService;
    }
    async previewProject(projectId, dto) {
        return this.codegenService.previewProject(projectId, dto);
    }
    async previewResource(projectId, resourceId, dto) {
        return this.codegenService.previewResource(projectId, resourceId, dto);
    }
    async listFrameworks() {
        return { frameworks: this.codegenService.getAvailableFrameworks() };
    }
};
exports.CodegenController = CodegenController;
__decorate([
    (0, common_1.Post)('preview'),
    (0, swagger_1.ApiOperation)({ summary: 'Preview generated code for all project resources' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Generated code preview' }),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CodegenPreviewDto]),
    __metadata("design:returntype", Promise)
], CodegenController.prototype, "previewProject", null);
__decorate([
    (0, common_1.Post)('preview/:resourceId'),
    (0, swagger_1.ApiOperation)({ summary: 'Preview generated code for a single resource' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Generated code preview' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Resource not found' }),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('resourceId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.CodegenPreviewDto]),
    __metadata("design:returntype", Promise)
], CodegenController.prototype, "previewResource", null);
__decorate([
    (0, common_1.Post)('frameworks'),
    (0, swagger_1.ApiOperation)({ summary: 'List available code generation frameworks' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of available frameworks' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CodegenController.prototype, "listFrameworks", null);
exports.CodegenController = CodegenController = __decorate([
    (0, swagger_1.ApiTags)('codegen'),
    (0, common_1.Controller)('api/v1/projects/:projectId/codegen'),
    __metadata("design:paramtypes", [codegen_service_1.CodegenService])
], CodegenController);
//# sourceMappingURL=codegen.controller.js.map