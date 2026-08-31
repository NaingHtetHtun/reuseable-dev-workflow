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
exports.CredentialsController = void 0;
const common_1 = require('@nestjs/common');
const credentials_service_1 = require('./credentials.service');
const dto_1 = require('./dto');
let CredentialsController = class CredentialsController {
  credentialsService;
  constructor(credentialsService) {
    this.credentialsService = credentialsService;
  }
  async create(projectId, dto) {
    return this.credentialsService.create(projectId, dto);
  }
  async findAll(projectId, page, limit, search, type) {
    return this.credentialsService.findAll(projectId, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search,
      type,
    });
  }
  async findOne(projectId, id) {
    return this.credentialsService.findOne(projectId, id);
  }
  async update(projectId, id, dto) {
    return this.credentialsService.update(projectId, id, dto);
  }
  async remove(projectId, id) {
    return this.credentialsService.remove(projectId, id);
  }
};
exports.CredentialsController = CredentialsController;
__decorate(
  [
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Body)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, dto_1.CreateCredentialDto]),
    __metadata('design:returntype', Promise),
  ],
  CredentialsController.prototype,
  'create',
  null,
);
__decorate(
  [
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('type')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, String, String, String, String]),
    __metadata('design:returntype', Promise),
  ],
  CredentialsController.prototype,
  'findAll',
  null,
);
__decorate(
  [
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, String]),
    __metadata('design:returntype', Promise),
  ],
  CredentialsController.prototype,
  'findOne',
  null,
);
__decorate(
  [
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, String, dto_1.UpdateCredentialDto]),
    __metadata('design:returntype', Promise),
  ],
  CredentialsController.prototype,
  'update',
  null,
);
__decorate(
  [
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, String]),
    __metadata('design:returntype', Promise),
  ],
  CredentialsController.prototype,
  'remove',
  null,
);
exports.CredentialsController = CredentialsController = __decorate(
  [
    (0, common_1.Controller)('projects/:projectId/credentials'),
    __metadata('design:paramtypes', [credentials_service_1.CredentialsService]),
  ],
  CredentialsController,
);
//# sourceMappingURL=credentials.controller.js.map
