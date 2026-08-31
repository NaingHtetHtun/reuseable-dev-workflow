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
exports.CodegenPreviewDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CodegenPreviewDto {
    framework;
    version;
    outputPrefix;
    includeComments;
}
exports.CodegenPreviewDto = CodegenPreviewDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Target framework',
        enum: ['typescript', 'laravel', 'nestjs'],
        example: 'typescript',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CodegenPreviewDto.prototype, "framework", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Framework version',
        example: '5.0',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CodegenPreviewDto.prototype, "version", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Output directory prefix',
        example: 'src/types',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CodegenPreviewDto.prototype, "outputPrefix", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Include comments in generated code',
        default: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CodegenPreviewDto.prototype, "includeComments", void 0);
//# sourceMappingURL=codegen-preview.dto.js.map