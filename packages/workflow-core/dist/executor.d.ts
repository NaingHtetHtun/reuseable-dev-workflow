import { WorkflowDefinition } from './types';
import { NodeRegistry } from './node-system/registry';
import { Logger } from './logger.interface';
export interface ExecutionResult {
  status: 'completed' | 'failed';
  output: unknown;
  error: string | null;
  nodeResults: Record<string, unknown>;
}
/** Function that resolves a credential ID to its decrypted data */
export type CredentialResolver = (id: string) => Promise<Record<string, unknown>>;
export declare class WorkflowExecutor {
  private readonly logger;
  private readonly registry;
  private readonly credentialResolver?;
  constructor(logger?: Logger, credentialResolver?: CredentialResolver);
  getRegistry(): NodeRegistry;
  execute(
    workflowId: string,
    executionId: string,
    definition: WorkflowDefinition,
    input: unknown,
  ): Promise<ExecutionResult>;
  private getNodeInput;
  private executeNode;
  private createDefaultRegistry;
  private topologicalSort;
}
//# sourceMappingURL=executor.d.ts.map
