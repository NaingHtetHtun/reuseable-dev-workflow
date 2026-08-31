import { WorkflowDefinition } from './types';
export interface ValidationResult {
    valid: boolean;
    errors: string[];
}
export declare function validateWorkflowDefinition(definition: WorkflowDefinition): ValidationResult;
//# sourceMappingURL=validator.d.ts.map