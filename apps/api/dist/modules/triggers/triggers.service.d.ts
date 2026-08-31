import { WebhookTriggerHandler } from '@devflow/workflow-core';
import type { TriggerTypeDefinition, TriggerHandler, TriggerActivationResult, TriggerEndpointInfo, ValidationResult } from '@devflow/workflow-core';
export interface TriggerConfig {
    type: string;
    config: Record<string, unknown>;
    enabled: boolean;
}
export interface TriggerStatus {
    workflowId: string;
    type: string;
    enabled: boolean;
    active: boolean;
    endpoint?: TriggerEndpointInfo;
}
export declare class TriggersService {
    private readonly registry;
    constructor();
    private registerBuiltInTriggers;
    getTriggerTypes(): TriggerTypeDefinition[];
    getTriggerType(type: string): {
        definition: TriggerTypeDefinition;
        handler: TriggerHandler;
    } | undefined;
    validateTriggerConfig(type: string, config: Record<string, unknown>): ValidationResult;
    activateTrigger(workflowId: string, type: string, config: Record<string, unknown>): Promise<TriggerActivationResult>;
    deactivateTrigger(workflowId: string, type: string): Promise<void>;
    getTriggerStatus(workflowId: string, type: string): Promise<TriggerStatus | null>;
    getWebhookHandler(): WebhookTriggerHandler | undefined;
}
