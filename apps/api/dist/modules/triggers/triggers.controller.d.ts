import { TriggersService } from './triggers.service';
export declare class TriggersController {
    private readonly triggersService;
    constructor(triggersService: TriggersService);
    getTriggerTypes(): import("@devflow/workflow-core").TriggerTypeDefinition[];
    activateTrigger(_projectId: string, workflowId: string, body: {
        type: string;
        config: Record<string, unknown>;
    }): Promise<import("@devflow/workflow-core").TriggerActivationResult>;
    deactivateTrigger(_projectId: string, workflowId: string, body: {
        type: string;
    }): Promise<{
        success: boolean;
    }>;
    getTriggerStatus(_projectId: string, workflowId: string, type: string): Promise<import("./triggers.service").TriggerStatus | null>;
}
