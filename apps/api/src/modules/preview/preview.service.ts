import { Injectable, Logger } from '@nestjs/common';
import {
  PreviewExecutor,
  type WorkflowDefinition,
  type WorkflowPreviewRequest,
  type WorkflowPreviewResult,
  type PreviewNodeResult,
  type PreviewOptions,
  type PreviewMode,
} from '@devflow/workflow-core';

@Injectable()
export class PreviewService {
  private readonly logger = new Logger(PreviewService.name);
  private readonly previewExecutor: PreviewExecutor;

  constructor() {
    this.previewExecutor = new PreviewExecutor(this.logger);
  }

  /**
   * Preview a workflow definition.
   */
  async previewWorkflow(
    definition: WorkflowDefinition,
    mode: PreviewMode,
    input?: unknown,
    options?: PreviewOptions,
  ): Promise<WorkflowPreviewResult> {
    const request: WorkflowPreviewRequest = {
      definition,
      mode,
      input,
      options,
    };

    this.logger.log(`Previewing workflow in "${mode}" mode`);
    return this.previewExecutor.preview(request);
  }

  /**
   * Validate a workflow definition without executing.
   */
  async validateWorkflow(definition: WorkflowDefinition): Promise<WorkflowPreviewResult> {
    return this.previewWorkflow(definition, 'validate');
  }

  /**
   * Preview a single node.
   */
  async previewNode(
    definition: WorkflowDefinition,
    nodeId: string,
    input?: unknown,
    options?: PreviewOptions,
  ): Promise<PreviewNodeResult> {
    this.logger.log(`Previewing node "${nodeId}"`);
    return this.previewExecutor.previewNode(definition, nodeId, input, options);
  }
}
