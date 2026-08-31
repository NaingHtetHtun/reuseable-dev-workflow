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
var PreviewService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.PreviewService = void 0;
const common_1 = require('@nestjs/common');
const workflow_core_1 = require('@devflow/workflow-core');
let PreviewService = (PreviewService_1 = class PreviewService {
  logger = new common_1.Logger(PreviewService_1.name);
  previewExecutor;
  constructor() {
    this.previewExecutor = new workflow_core_1.PreviewExecutor(this.logger);
  }
  async previewWorkflow(definition, mode, input, options) {
    const request = {
      definition,
      mode,
      input,
      options,
    };
    this.logger.log(`Previewing workflow in "${mode}" mode`);
    return this.previewExecutor.preview(request);
  }
  async validateWorkflow(definition) {
    return this.previewWorkflow(definition, 'validate');
  }
  async previewNode(definition, nodeId, input, options) {
    this.logger.log(`Previewing node "${nodeId}"`);
    return this.previewExecutor.previewNode(definition, nodeId, input, options);
  }
});
exports.PreviewService = PreviewService;
exports.PreviewService =
  PreviewService =
  PreviewService_1 =
    __decorate([(0, common_1.Injectable)(), __metadata('design:paramtypes', [])], PreviewService);
//# sourceMappingURL=preview.service.js.map
