"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var WebhooksService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksService = void 0;
const common_1 = require("@nestjs/common");
const triggers_service_1 = require("../triggers/triggers.service");
const workflows_service_1 = require("../workflows/workflows.service");
const crypto_1 = require("crypto");
let WebhooksService = WebhooksService_1 = class WebhooksService {
    triggersService;
    workflowsService;
    logger = new common_1.Logger(WebhooksService_1.name);
    processedEvents = new Map();
    deduplicationWindowMs = 5 * 60 * 1000;
    constructor(triggersService, workflowsService) {
        this.triggersService = triggersService;
        this.workflowsService = workflowsService;
    }
    async handleWebhook(token, headers, body) {
        const webhookHandler = this.triggersService.getWebhookHandler();
        if (!webhookHandler) {
            return { status: 'error', error: 'Webhook handler not available' };
        }
        const webhookConfig = webhookHandler.getByToken(token);
        if (!webhookConfig) {
            return { status: 'error', error: 'Invalid webhook token' };
        }
        if (webhookConfig.authentication === 'secret' || webhookConfig.authentication === 'hmac') {
            if (!webhookConfig.secret) {
                this.logger.warn(`Webhook ${token} has auth configured but no secret`);
                return { status: 'error', error: 'Webhook secret not configured' };
            }
            const isValid = webhookHandler.validateRequest(headers, body, webhookConfig.secret);
            if (!isValid) {
                return { status: 'error', error: 'Invalid webhook signature' };
            }
        }
        const eventId = headers['x-webhook-id'] || (0, crypto_1.randomUUID)();
        const deduplicationKey = `${webhookConfig.workflowId}:${eventId}`;
        if (this.isDuplicate(deduplicationKey)) {
            return { status: 'skipped', reason: 'duplicate' };
        }
        this.markProcessed(deduplicationKey);
        try {
            const workflow = await this.workflowsService.findOne(webhookConfig.workflowId, webhookConfig.workflowId);
            if (!workflow) {
                return { status: 'error', error: 'Workflow not found' };
            }
            this.logger.log(`Webhook triggered workflow ${webhookConfig.workflowId} via event ${eventId}`);
            return {
                status: 'executed',
                executionId: eventId,
            };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Webhook execution failed: ${message}`);
            return { status: 'error', error: message };
        }
    }
    isDuplicate(key) {
        const processedAt = this.processedEvents.get(key);
        if (!processedAt)
            return false;
        if (Date.now() - processedAt > this.deduplicationWindowMs) {
            this.processedEvents.delete(key);
            return false;
        }
        return true;
    }
    markProcessed(key) {
        this.processedEvents.set(key, Date.now());
        if (this.processedEvents.size > 1000) {
            const now = Date.now();
            for (const [k, v] of this.processedEvents) {
                if (now - v > this.deduplicationWindowMs) {
                    this.processedEvents.delete(k);
                }
            }
        }
    }
};
exports.WebhooksService = WebhooksService;
exports.WebhooksService = WebhooksService = WebhooksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [triggers_service_1.TriggersService,
        workflows_service_1.WorkflowsService])
], WebhooksService);
//# sourceMappingURL=webhooks.service.js.map