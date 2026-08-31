import type { ComponentStatus } from '@devflow/workflow-core';
export declare class UpdateComponentDto {
  displayName?: string;
  description?: string;
  status?: ComponentStatus;
  category?: string;
  tags?: string[];
  author?: string;
  configSchema?: Record<string, unknown>;
  credentialSchema?: Record<string, unknown>;
  inputSchema?: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
  implementation?: Record<string, unknown>;
}
