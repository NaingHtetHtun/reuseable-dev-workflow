import type { ComponentStatus } from '@devflow/workflow-core';
export declare class ComponentResponseDto {
    id: string;
    projectId: string;
    name: string;
    displayName: string;
    description?: string;
    version: string;
    status: ComponentStatus;
    category?: string;
    tags: string[];
    author?: string;
    createdAt: Date;
    updatedAt: Date;
}
