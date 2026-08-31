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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowPreviewDto = exports.PreviewOptionsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class PreviewOptionsDto {
    timeoutMs;
    executeHttp;
    executeDelays;
    maxNodes;
}
exports.PreviewOptionsDto = PreviewOptionsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Maximum execution time in ms', default: 30000 }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], PreviewOptionsDto.prototype, "timeoutMs", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether to actually execute HTTP requests', default: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], PreviewOptionsDto.prototype, "executeHttp", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether to execute delays', default: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], PreviewOptionsDto.prototype, "executeDelays", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Maximum nodes to execute' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], PreviewOptionsDto.prototype, "maxNodes", void 0);
class WorkflowPreviewDto {
    definition;
    mode;
    input;
    nodeId;
    options;
}
exports.WorkflowPreviewDto = WorkflowPreviewDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Workflow definition to preview' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], WorkflowPreviewDto.prototype, "definition", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Preview mode',
        enum: ['validate', 'dry-run', 'execute', 'step'],
        default: 'validate',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['validate', 'dry-run', 'execute', 'step']),
    __metadata("design:type", String)
], WorkflowPreviewDto.prototype, "mode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Test input data' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], WorkflowPreviewDto.prototype, "input", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Node ID to preview (for step mode)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WorkflowPreviewDto.prototype, "nodeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Preview options', type: PreviewOptionsDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", PreviewOptionsDto)
], WorkflowPreviewDto.prototype, "options", void 0);
//# sourceMappingURL=workflow-preview.dto.js.map