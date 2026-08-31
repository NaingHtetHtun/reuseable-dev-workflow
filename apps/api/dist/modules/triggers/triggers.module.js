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
Object.defineProperty(exports, '__esModule', { value: true });
exports.TriggersModule = void 0;
const common_1 = require('@nestjs/common');
const triggers_controller_1 = require('./triggers.controller');
const triggers_service_1 = require('./triggers.service');
const workflows_module_1 = require('../workflows/workflows.module');
let TriggersModule = class TriggersModule {};
exports.TriggersModule = TriggersModule;
exports.TriggersModule = TriggersModule = __decorate(
  [
    (0, common_1.Module)({
      imports: [workflows_module_1.WorkflowsModule],
      controllers: [triggers_controller_1.TriggersController],
      providers: [triggers_service_1.TriggersService],
      exports: [triggers_service_1.TriggersService],
    }),
  ],
  TriggersModule,
);
//# sourceMappingURL=triggers.module.js.map
