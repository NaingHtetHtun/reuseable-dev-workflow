import type { PreviewOptions } from '@devflow/workflow-core';
export declare class NodePreviewDto {
    definition: Record<string, unknown>;
    nodeId: string;
    input?: unknown;
    options?: Partial<PreviewOptions>;
}
