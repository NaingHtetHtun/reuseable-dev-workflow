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
exports.UpdateResourceDto = void 0;
const swagger_1 = require('@nestjs/swagger');
const class_validator_1 = require('class-validator');
class UpdateResourceDto {
  displayName;
  description;
  tableName;
  status;
  fields;
}
exports.UpdateResourceDto = UpdateResourceDto;
__decorate(
  [
    (0, swagger_1.ApiPropertyOptional)({ description: 'Human-readable display name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata('design:type', String),
  ],
  UpdateResourceDto.prototype,
  'displayName',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata('design:type', String),
  ],
  UpdateResourceDto.prototype,
  'description',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiPropertyOptional)({ description: 'Table name override' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata('design:type', String),
  ],
  UpdateResourceDto.prototype,
  'tableName',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiPropertyOptional)({
      description: 'Resource status',
      enum: ['draft', 'published', 'deprecated'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['draft', 'published', 'deprecated']),
    __metadata('design:type', String),
  ],
  UpdateResourceDto.prototype,
  'status',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiPropertyOptional)({ description: 'Resource fields (replaces all fields)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata('design:type', Array),
  ],
  UpdateResourceDto.prototype,
  'fields',
  void 0,
);
//# sourceMappingURL=update-resource.dto.js.map
