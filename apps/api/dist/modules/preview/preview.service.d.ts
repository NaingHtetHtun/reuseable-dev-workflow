import {
  type WorkflowDefinition,
  type WorkflowPreviewResult,
  type PreviewNodeResult,
  type PreviewOptions,
  type PreviewMode,
} from '@devflow/workflow-core';
export declare class PreviewService {
  private readonly logger;
  private readonly previewExecutor;
  constructor();
  previewWorkflow(
    definition: WorkflowDefinition,
    mode: PreviewMode,
    input?: unknown,
    options?: PreviewOptions,
  ): Promise<WorkflowPreviewResult>;
  validateWorkflow(definition: WorkflowDefinition): Promise<WorkflowPreviewResult>;
  previewNode(
    definition: WorkflowDefinition,
    nodeId: string,
    input?: unknown,
    options?: PreviewOptions,
  ): Promise<PreviewNodeResult>;
}
