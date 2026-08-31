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
exports.PreviewController = void 0;
const common_1 = require('@nestjs/common');
const swagger_1 = require('@nestjs/swagger');
const preview_service_1 = require('./preview.service');
const dto_1 = require('./dto');
let PreviewController = class PreviewController {
  previewService;
  constructor(previewService) {
    this.previewService = previewService;
  }
  async previewWorkflow(dto) {
    const definition = dto.definition;
    return this.previewService.previewWorkflow(definition, dto.mode, dto.input, dto.options);
  }
  async validateWorkflow(dto) {
    const definition = dto.definition;
    return this.previewService.validateWorkflow(definition);
  }
  async previewNode(dto) {
    const definition = dto.definition;
    return this.previewService.previewNode(definition, dto.nodeId, dto.input, dto.options);
  }
};
exports.PreviewController = PreviewController;
__decorate(
  [
    (0, common_1.Post)('workflow'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Preview a workflow definition' }),
    (0, swagger_1.ApiResponse)({
      status: 200,
      description: 'Workflow preview result',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          mode: { type: 'string', enum: ['validate', 'dry-run', 'execute', 'step'] },
          validationErrors: { type: 'array', items: { type: 'string' } },
          nodeResults: { type: 'array' },
          output: {},
          durationMs: { type: 'number' },
          warnings: { type: 'array', items: { type: 'string' } },
        },
      },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input' }),
    __param(0, (0, common_1.Body)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [dto_1.WorkflowPreviewDto]),
    __metadata('design:returntype', Promise),
  ],
  PreviewController.prototype,
  'previewWorkflow',
  null,
);
__decorate(
  [
    (0, common_1.Post)('workflow/validate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Validate a workflow definition' }),
    (0, swagger_1.ApiResponse)({
      status: 200,
      description: 'Validation result',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          mode: { type: 'string', enum: ['validate'] },
          validationErrors: { type: 'array', items: { type: 'string' } },
          nodeResults: { type: 'array' },
          output: {},
          durationMs: { type: 'number' },
          warnings: { type: 'array', items: { type: 'string' } },
        },
      },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input' }),
    __param(0, (0, common_1.Body)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [dto_1.WorkflowPreviewDto]),
    __metadata('design:returntype', Promise),
  ],
  PreviewController.prototype,
  'validateWorkflow',
  null,
);
__decorate(
  [
    (0, common_1.Post)('node'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Preview a single node' }),
    (0, swagger_1.ApiResponse)({
      status: 200,
      description: 'Node preview result',
      schema: {
        type: 'object',
        properties: {
          nodeId: { type: 'string' },
          nodeType: { type: 'string' },
          nodeName: { type: 'string' },
          input: {},
          output: {},
          success: { type: 'boolean' },
          error: { type: 'string' },
          durationMs: { type: 'number' },
        },
      },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input' }),
    __param(0, (0, common_1.Body)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [dto_1.NodePreviewDto]),
    __metadata('design:returntype', Promise),
  ],
  PreviewController.prototype,
  'previewNode',
  null,
);
exports.PreviewController = PreviewController = __decorate(
  [
    (0, swagger_1.ApiTags)('preview'),
    (0, common_1.Controller)('api/v1/preview'),
    __metadata('design:paramtypes', [preview_service_1.PreviewService]),
  ],
  PreviewController,
);
//# sourceMappingURL=preview.controller.js.map
