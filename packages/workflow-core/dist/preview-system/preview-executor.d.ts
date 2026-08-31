import type { WorkflowDefinition } from '../types';
import type { Logger } from '../logger.interface';
import type {
  WorkflowPreviewRequest,
  WorkflowPreviewResult,
  PreviewNodeResult,
  PreviewOptions,
} from './preview-types';
/**
 * Executes workflow previews in a sandboxed context.
 * Supports validation, dry-run, execute, and step-through modes.
 */
export declare class PreviewExecutor {
  private readonly logger;
  constructor(logger?: Logger);
  /**
   * Execute a workflow preview.
   */
  preview(request: WorkflowPreviewRequest): Promise<WorkflowPreviewResult>;
  /**
   * Preview a single node.
   */
  previewNode(
    definition: WorkflowDefinition,
    nodeId: string,
    input: unknown,
    options?: PreviewOptions,
  ): Promise<PreviewNodeResult>;
  private validateOnly;
  private dryRun;
  private executeWorkflow;
  private getNodeInput;
  private topologicalSort;
}
//# sourceMappingURL=preview-executor.d.ts.map
