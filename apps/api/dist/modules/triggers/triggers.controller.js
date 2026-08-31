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
exports.TriggersController = void 0;
const common_1 = require('@nestjs/common');
const triggers_service_1 = require('./triggers.service');
let TriggersController = class TriggersController {
  triggersService;
  constructor(triggersService) {
    this.triggersService = triggersService;
  }
  getTriggerTypes() {
    return this.triggersService.getTriggerTypes();
  }
  async activateTrigger(_projectId, workflowId, body) {
    const result = await this.triggersService.activateTrigger(workflowId, body.type, body.config);
    return result;
  }
  async deactivateTrigger(_projectId, workflowId, body) {
    await this.triggersService.deactivateTrigger(workflowId, body.type);
    return { success: true };
  }
  async getTriggerStatus(_projectId, workflowId, type) {
    const status = await this.triggersService.getTriggerStatus(workflowId, type || 'manual');
    return status;
  }
};
exports.TriggersController = TriggersController;
__decorate(
  [
    (0, common_1.Get)('trigger-types'),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', []),
    __metadata('design:returntype', void 0),
  ],
  TriggersController.prototype,
  'getTriggerTypes',
  null,
);
__decorate(
  [
    (0, common_1.Post)('projects/:projectId/workflows/:workflowId/trigger/activate'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('workflowId')),
    __param(2, (0, common_1.Body)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, String, Object]),
    __metadata('design:returntype', Promise),
  ],
  TriggersController.prototype,
  'activateTrigger',
  null,
);
__decorate(
  [
    (0, common_1.Post)('projects/:projectId/workflows/:workflowId/trigger/deactivate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('workflowId')),
    __param(2, (0, common_1.Body)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, String, Object]),
    __metadata('design:returntype', Promise),
  ],
  TriggersController.prototype,
  'deactivateTrigger',
  null,
);
__decorate(
  [
    (0, common_1.Get)('projects/:projectId/workflows/:workflowId/trigger/status'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('workflowId')),
    __param(2, (0, common_1.Param)('type')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, String, String]),
    __metadata('design:returntype', Promise),
  ],
  TriggersController.prototype,
  'getTriggerStatus',
  null,
);
exports.TriggersController = TriggersController = __decorate(
  [
    (0, common_1.Controller)('api/v1'),
    __metadata('design:paramtypes', [triggers_service_1.TriggersService]),
  ],
  TriggersController,
);
//# sourceMappingURL=triggers.controller.js.map
