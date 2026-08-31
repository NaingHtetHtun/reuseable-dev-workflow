import type { ResourceStatus } from '@devflow/workflow-core';
export declare class ResourceResponseDto {
  id: string;
  projectId: string;
  name: string;
  displayName: string;
  description?: string;
  tableName?: string;
  version: string;
  status: ResourceStatus;
  fields: Record<string, unknown>[];
  createdAt: Date;
  updatedAt: Date;
}
