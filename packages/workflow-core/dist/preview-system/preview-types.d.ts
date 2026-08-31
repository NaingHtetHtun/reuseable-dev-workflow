import type { WorkflowDefinition } from '../types';
/** Preview mode — how the workflow should be previewed */
export type PreviewMode = 'validate' | 'dry-run' | 'execute' | 'step';
/** Request to preview a workflow */
export interface WorkflowPreviewRequest {
    /** Workflow definition to preview */
    definition: WorkflowDefinition;
    /** Preview mode */
    mode: PreviewMode;
    /** Test input data */
    input?: unknown;
    /** Node ID to preview (for 'step' mode) */
    nodeId?: string;
    /** Options for the preview */
    options?: PreviewOptions;
}
/** Options controlling preview behavior */
export interface PreviewOptions {
    /** Maximum execution time in ms (default: 30000) */
    timeoutMs?: number;
    /** Whether to actually execute HTTP requests (default: false — mocks them) */
    executeHttp?: boolean;
    /** Whether to execute delays (default: false — skips them) */
    executeDelays?: boolean;
    /** Maximum nodes to execute (default: all) */
    maxNodes?: number;
}
/** Result of a workflow preview */
export interface WorkflowPreviewResult {
    /** Whether the preview succeeded */
    success: boolean;
    /** Preview mode used */
    mode: PreviewMode;
    /** Validation errors (if any) */
    validationErrors: string[];
    /** Node execution results (step-by-step) */
    nodeResults: PreviewNodeResult[];
    /** Final output (if execute mode) */
    output: unknown;
    /** Execution time in ms */
    durationMs: number;
    /** Warnings (non-fatal issues) */
    warnings: string[];
}
/** Result of a single node preview */
export interface PreviewNodeResult {
    /** Node ID */
    nodeId: string;
    /** Node type */
    nodeType: string;
    /** Node name */
    nodeName: string;
    /** Input received by this node */
    input: unknown;
    /** Output produced by this node */
    output: unknown;
    /** Whether this node executed successfully */
    success: boolean;
    /** Error message if failed */
    error?: string;
    /** Execution time in ms */
    durationMs: number;
}
//# sourceMappingURL=preview-types.d.ts.map