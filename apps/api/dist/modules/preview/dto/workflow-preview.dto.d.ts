import type { PreviewMode, PreviewOptions } from '@devflow/workflow-core';
export declare class PreviewOptionsDto implements PreviewOptions {
    timeoutMs?: number;
    executeHttp?: boolean;
    executeDelays?: boolean;
    maxNodes?: number;
}
export declare class WorkflowPreviewDto {
    definition: Record<string, unknown>;
    mode: PreviewMode;
    input?: unknown;
    nodeId?: string;
    options?: PreviewOptionsDto;
}
