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
exports.TriggersService = void 0;
const common_1 = require('@nestjs/common');
const workflow_core_1 = require('@devflow/workflow-core');
let TriggersService = class TriggersService {
  registry;
  constructor() {
    this.registry = new workflow_core_1.TriggerTypeRegistry();
    this.registerBuiltInTriggers();
  }
  registerBuiltInTriggers() {
    const manualDef = {
      type: 'manual',
      displayName: 'Manual Trigger',
      description: 'Execute workflow manually via API call',
      category: 'manual',
      version: 1,
      configSchema: { type: 'object', properties: {} },
      outputSchema: { type: 'object', properties: { input: { type: 'object' } } },
      requiresAuth: false,
      hasEndpoint: false,
      supportedStatuses: ['active', 'draft'],
    };
    this.registry.register(manualDef, new workflow_core_1.ManualTriggerHandler());
    const webhookDef = {
      type: 'webhook',
      displayName: 'Webhook Trigger',
      description: 'Execute workflow when HTTP request is received',
      category: 'http',
      version: 1,
      configSchema: {
        type: 'object',
        properties: {
          method: {
            type: 'string',
            enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
            default: 'POST',
          },
          path: { type: 'string', description: 'Custom path suffix' },
          authentication: { type: 'string', enum: ['none', 'secret', 'hmac'], default: 'secret' },
          secret: { type: 'string', description: 'Webhook secret for validation' },
        },
      },
      outputSchema: {
        type: 'object',
        properties: {
          method: { type: 'string' },
          headers: { type: 'object' },
          query: { type: 'object' },
          body: { type: 'object' },
          path: { type: 'string' },
        },
      },
      requiresAuth: false,
      hasEndpoint: true,
      supportedStatuses: ['active'],
    };
    this.registry.register(webhookDef, new workflow_core_1.WebhookTriggerHandler());
    const scheduledDef = {
      type: 'scheduled',
      displayName: 'Scheduled Trigger',
      description: 'Execute workflow on a cron schedule',
      category: 'schedule',
      version: 1,
      configSchema: {
        type: 'object',
        properties: {
          cron: { type: 'string', description: 'Cron expression (e.g., "0 9 * * 1-5")' },
          timezone: { type: 'string', description: 'Timezone for cron expression', default: 'UTC' },
        },
        required: ['cron'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          scheduledTime: { type: 'string' },
          triggeredAt: { type: 'string' },
        },
      },
      requiresAuth: false,
      hasEndpoint: false,
      supportedStatuses: ['active'],
    };
    this.registry.register(scheduledDef, new workflow_core_1.ScheduledTriggerHandler());
  }
  getTriggerTypes() {
    return this.registry.getDefinitions();
  }
  getTriggerType(type) {
    return this.registry.get(type);
  }
  validateTriggerConfig(type, config) {
    const entry = this.registry.get(type);
    if (!entry) {
      return { valid: false, errors: [`Unknown trigger type: ${type}`] };
    }
    return entry.handler.validateConfig(config);
  }
  async activateTrigger(workflowId, type, config) {
    const entry = this.registry.get(type);
    if (!entry) {
      return { success: false, error: `Unknown trigger type: ${type}` };
    }
    return entry.handler.activate(workflowId, config);
  }
  async deactivateTrigger(workflowId, type) {
    const entry = this.registry.get(type);
    if (entry) {
      await entry.handler.deactivate(workflowId);
    }
  }
  async getTriggerStatus(workflowId, type) {
    const entry = this.registry.get(type);
    if (!entry) return null;
    const active = await entry.handler.isActive(workflowId);
    let endpoint;
    if (entry.handler.getEndpointInfo) {
      endpoint = await entry.handler.getEndpointInfo(workflowId);
    }
    return {
      workflowId,
      type,
      enabled: true,
      active,
      endpoint: endpoint ?? undefined,
    };
  }
  getWebhookHandler() {
    const entry = this.registry.get('webhook');
    return entry?.handler;
  }
};
exports.TriggersService = TriggersService;
exports.TriggersService = TriggersService = __decorate(
  [(0, common_1.Injectable)(), __metadata('design:paramtypes', [])],
  TriggersService,
);
//# sourceMappingURL=triggers.service.js.map
