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
exports.CreateResourceDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class ResourceFieldDto {
    name;
    displayName;
    type;
    required;
    unique;
    default;
    description;
    minLength;
    maxLength;
    minimum;
    maximum;
    pattern;
    enum;
    relationResource;
    relationType;
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Field name (snake_case)', example: 'display_name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^[a-z][a-z0-9_]*$/, {
        message: 'Field name must be snake_case',
    }),
    __metadata("design:type", String)
], ResourceFieldDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Display name', example: 'Display Name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ResourceFieldDto.prototype, "displayName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Field type',
        enum: [
            'string',
            'text',
            'boolean',
            'integer',
            'float',
            'timestamp',
            'json',
            'enum',
            'relation',
        ],
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ResourceFieldDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether the field is required' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Boolean)
], ResourceFieldDto.prototype, "required", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether the field is unique' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], ResourceFieldDto.prototype, "unique", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Default value' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], ResourceFieldDto.prototype, "default", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResourceFieldDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Min length (string/text)' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ResourceFieldDto.prototype, "minLength", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Max length (string/text)' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ResourceFieldDto.prototype, "maxLength", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Minimum value (integer/float)' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ResourceFieldDto.prototype, "minimum", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Maximum value (integer/float)' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ResourceFieldDto.prototype, "maximum", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Regex pattern (string)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResourceFieldDto.prototype, "pattern", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Enum values', type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ResourceFieldDto.prototype, "enum", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Target resource name (relation)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResourceFieldDto.prototype, "relationResource", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Relation type',
        enum: ['one-to-one', 'one-to-many', 'many-to-many'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResourceFieldDto.prototype, "relationType", void 0);
class CreateResourceDto {
    name;
    displayName;
    description;
    tableName;
    fields;
}
exports.CreateResourceDto = CreateResourceDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Resource name (PascalCase)',
        example: 'Category',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^[A-Z][a-zA-Z0-9]*$/, {
        message: 'Resource name must be PascalCase',
    }),
    __metadata("design:type", String)
], CreateResourceDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Human-readable display name',
        example: 'Category',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateResourceDto.prototype, "displayName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateResourceDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Table name override (default: snake_case of name)',
        example: 'categories',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateResourceDto.prototype, "tableName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Resource fields',
        type: [ResourceFieldDto],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ResourceFieldDto),
    __metadata("design:type", Array)
], CreateResourceDto.prototype, "fields", void 0);
//# sourceMappingURL=create-resource.dto.js.map