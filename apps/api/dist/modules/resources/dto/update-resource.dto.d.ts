import type { ResourceStatus } from '@devflow/workflow-core';
export declare class UpdateResourceDto {
    displayName?: string;
    description?: string;
    tableName?: string;
    status?: ResourceStatus;
    fields?: Record<string, unknown>[];
}
