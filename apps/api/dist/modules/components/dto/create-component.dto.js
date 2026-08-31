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
Object.defineProperty(exports, '__esModule', { value: true });
exports.CreateComponentDto = void 0;
const swagger_1 = require('@nestjs/swagger');
const class_validator_1 = require('class-validator');
class CreateComponentDto {
  name;
  displayName;
  description;
  category;
  tags;
  author;
  configSchema;
  credentialSchema;
  inputSchema;
  outputSchema;
  implementation;
}
exports.CreateComponentDto = CreateComponentDto;
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Component name (lowercase, numbers, hyphens only)',
      example: 'google-login',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^[a-z0-9-]+$/, {
      message: 'Name must contain only lowercase letters, numbers, and hyphens',
    }),
    (0, class_validator_1.MaxLength)(100),
    __metadata('design:type', String),
  ],
  CreateComponentDto.prototype,
  'name',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Human-readable display name',
      example: 'Google Login',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata('design:type', String),
  ],
  CreateComponentDto.prototype,
  'displayName',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiPropertyOptional)({
      description: 'Detailed description of what the component does',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata('design:type', String),
  ],
  CreateComponentDto.prototype,
  'description',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiPropertyOptional)({
      description: 'Category for grouping',
      example: 'auth',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata('design:type', String),
  ],
  CreateComponentDto.prototype,
  'category',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiPropertyOptional)({
      description: 'Tags for search and filtering',
      example: ['google', 'oauth', 'login'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata('design:type', Array),
  ],
  CreateComponentDto.prototype,
  'tags',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiPropertyOptional)({
      description: 'Author name or identifier',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata('design:type', String),
  ],
  CreateComponentDto.prototype,
  'author',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiPropertyOptional)({
      description: 'Configuration schema for user-configurable options',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata('design:type', Object),
  ],
  CreateComponentDto.prototype,
  'configSchema',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiPropertyOptional)({
      description: 'Credential schema for required credentials',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata('design:type', Object),
  ],
  CreateComponentDto.prototype,
  'credentialSchema',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiPropertyOptional)({
      description: 'Input schema for accepted data',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata('design:type', Object),
  ],
  CreateComponentDto.prototype,
  'inputSchema',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiPropertyOptional)({
      description: 'Output schema for produced data',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata('design:type', Object),
  ],
  CreateComponentDto.prototype,
  'outputSchema',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiPropertyOptional)({
      description: 'Component implementation',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata('design:type', Object),
  ],
  CreateComponentDto.prototype,
  'implementation',
  void 0,
);
//# sourceMappingURL=create-component.dto.js.map
