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
var __param =
  (this && this.__param) ||
  function (paramIndex, decorator) {
    return function (target, key) {
      decorator(target, key, paramIndex);
    };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.ComponentsController = void 0;
const common_1 = require('@nestjs/common');
const swagger_1 = require('@nestjs/swagger');
const components_service_1 = require('./components.service');
const dto_1 = require('./dto');
let ComponentsController = class ComponentsController {
  componentsService;
  constructor(componentsService) {
    this.componentsService = componentsService;
  }
  async create(projectId, dto) {
    return this.componentsService.create(projectId, dto);
  }
  async findAll(projectId, page, limit, search, category, status) {
    return this.componentsService.findAll(projectId, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search,
      category,
      status,
    });
  }
  async findOne(projectId, id) {
    return this.componentsService.findOne(projectId, id);
  }
  async update(projectId, id, dto) {
    return this.componentsService.update(projectId, id, dto);
  }
  async remove(projectId, id) {
    await this.componentsService.remove(projectId, id);
  }
  async createVersion(projectId, id, body) {
    return this.componentsService.createVersion(projectId, id, body.version, body.changelog);
  }
  async listVersions(projectId, id) {
    return this.componentsService.listVersions(projectId, id);
  }
  async getVersion(projectId, id, version) {
    return this.componentsService.getVersion(projectId, id, version);
  }
  async clone(projectId, id, body) {
    return this.componentsService.clone(projectId, id, body.name);
  }
};
exports.ComponentsController = ComponentsController;
__decorate(
  [
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new component' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Component created' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Name already exists' }),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Body)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, dto_1.CreateComponentDto]),
    __metadata('design:returntype', Promise),
  ],
  ComponentsController.prototype,
  'create',
  null,
);
__decorate(
  [
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List components' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of components' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'category', required: false, type: String }),
    (0, swagger_1.ApiQuery)({
      name: 'status',
      required: false,
      enum: ['draft', 'published', 'deprecated'],
    }),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('category')),
    __param(5, (0, common_1.Query)('status')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, String, String, String, String, String]),
    __metadata('design:returntype', Promise),
  ],
  ComponentsController.prototype,
  'findAll',
  null,
);
__decorate(
  [
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a component' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Component details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Not found' }),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, String]),
    __metadata('design:returntype', Promise),
  ],
  ComponentsController.prototype,
  'findOne',
  null,
);
__decorate(
  [
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a component' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Component updated' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Not found' }),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, String, dto_1.UpdateComponentDto]),
    __metadata('design:returntype', Promise),
  ],
  ComponentsController.prototype,
  'update',
  null,
);
__decorate(
  [
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a component' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Deleted' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Not found' }),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, String]),
    __metadata('design:returntype', Promise),
  ],
  ComponentsController.prototype,
  'remove',
  null,
);
__decorate(
  [
    (0, common_1.Post)(':id/versions'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new version' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Version created' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Version already exists' }),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, String, Object]),
    __metadata('design:returntype', Promise),
  ],
  ComponentsController.prototype,
  'createVersion',
  null,
);
__decorate(
  [
    (0, common_1.Get)(':id/versions'),
    (0, swagger_1.ApiOperation)({ summary: 'List versions' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of versions' }),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, String]),
    __metadata('design:returntype', Promise),
  ],
  ComponentsController.prototype,
  'listVersions',
  null,
);
__decorate(
  [
    (0, common_1.Get)(':id/versions/:version'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific version' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Version details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Not found' }),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('version')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, String, String]),
    __metadata('design:returntype', Promise),
  ],
  ComponentsController.prototype,
  'getVersion',
  null,
);
__decorate(
  [
    (0, common_1.Post)(':id/clone'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Clone a component' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Component cloned' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Name already exists' }),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, String, Object]),
    __metadata('design:returntype', Promise),
  ],
  ComponentsController.prototype,
  'clone',
  null,
);
exports.ComponentsController = ComponentsController = __decorate(
  [
    (0, swagger_1.ApiTags)('components'),
    (0, common_1.Controller)('api/v1/projects/:projectId/components'),
    __metadata('design:paramtypes', [components_service_1.ComponentsService]),
  ],
  ComponentsController,
);
//# sourceMappingURL=components.controller.js.map
