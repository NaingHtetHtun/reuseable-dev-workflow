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
exports.ComponentResponseDto = void 0;
const swagger_1 = require('@nestjs/swagger');
class ComponentResponseDto {
  id;
  projectId;
  name;
  displayName;
  description;
  version;
  status;
  category;
  tags;
  author;
  createdAt;
  updatedAt;
}
exports.ComponentResponseDto = ComponentResponseDto;
__decorate(
  [(0, swagger_1.ApiProperty)({ description: 'Component ID' }), __metadata('design:type', String)],
  ComponentResponseDto.prototype,
  'id',
  void 0,
);
__decorate(
  [(0, swagger_1.ApiProperty)({ description: 'Project ID' }), __metadata('design:type', String)],
  ComponentResponseDto.prototype,
  'projectId',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({ description: 'Component name' }),
    __metadata('design:type', String),
  ],
  ComponentResponseDto.prototype,
  'name',
  void 0,
);
__decorate(
  [(0, swagger_1.ApiProperty)({ description: 'Display name' }), __metadata('design:type', String)],
  ComponentResponseDto.prototype,
  'displayName',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description' }),
    __metadata('design:type', String),
  ],
  ComponentResponseDto.prototype,
  'description',
  void 0,
);
__decorate(
  [(0, swagger_1.ApiProperty)({ description: 'Version' }), __metadata('design:type', String)],
  ComponentResponseDto.prototype,
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
  ComponentResponseDto.prototype,
  'status',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiPropertyOptional)({ description: 'Category' }),
    __metadata('design:type', String),
  ],
  ComponentResponseDto.prototype,
  'category',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({ description: 'Tags', type: [String] }),
    __metadata('design:type', Array),
  ],
  ComponentResponseDto.prototype,
  'tags',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiPropertyOptional)({ description: 'Author' }),
    __metadata('design:type', String),
  ],
  ComponentResponseDto.prototype,
  'author',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({ description: 'Created timestamp' }),
    __metadata('design:type', Date),
  ],
  ComponentResponseDto.prototype,
  'createdAt',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({ description: 'Updated timestamp' }),
    __metadata('design:type', Date),
  ],
  ComponentResponseDto.prototype,
  'updatedAt',
  void 0,
);
//# sourceMappingURL=component-response.dto.js.map
