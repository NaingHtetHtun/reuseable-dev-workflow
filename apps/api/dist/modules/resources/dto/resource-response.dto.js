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
exports.ResourceResponseDto = void 0;
const swagger_1 = require('@nestjs/swagger');
class ResourceResponseDto {
  id;
  projectId;
  name;
  displayName;
  description;
  tableName;
  version;
  status;
  fields;
  createdAt;
  updatedAt;
}
exports.ResourceResponseDto = ResourceResponseDto;
__decorate(
  [(0, swagger_1.ApiProperty)({ description: 'Resource ID' }), __metadata('design:type', String)],
  ResourceResponseDto.prototype,
  'id',
  void 0,
);
__decorate(
  [(0, swagger_1.ApiProperty)({ description: 'Project ID' }), __metadata('design:type', String)],
  ResourceResponseDto.prototype,
  'projectId',
  void 0,
);
__decorate(
  [(0, swagger_1.ApiProperty)({ description: 'Resource name' }), __metadata('design:type', String)],
  ResourceResponseDto.prototype,
  'name',
  void 0,
);
__decorate(
  [(0, swagger_1.ApiProperty)({ description: 'Display name' }), __metadata('design:type', String)],
  ResourceResponseDto.prototype,
  'displayName',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description' }),
    __metadata('design:type', String),
  ],
  ResourceResponseDto.prototype,
  'description',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiPropertyOptional)({ description: 'Table name override' }),
    __metadata('design:type', String),
  ],
  ResourceResponseDto.prototype,
  'tableName',
  void 0,
);
__decorate(
  [(0, swagger_1.ApiProperty)({ description: 'Version' }), __metadata('design:type', String)],
  ResourceResponseDto.prototype,
  'version',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Status',
      enum: ['draft', 'published', 'deprecated'],
    }),
    __metadata('design:type', String),
  ],
  ResourceResponseDto.prototype,
  'status',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({ description: 'Fields', type: 'array', items: { type: 'object' } }),
    __metadata('design:type', Array),
  ],
  ResourceResponseDto.prototype,
  'fields',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({ description: 'Created timestamp' }),
    __metadata('design:type', Date),
  ],
  ResourceResponseDto.prototype,
  'createdAt',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({ description: 'Updated timestamp' }),
    __metadata('design:type', Date),
  ],
  ResourceResponseDto.prototype,
  'updatedAt',
  void 0,
);
//# sourceMappingURL=resource-response.dto.js.map
