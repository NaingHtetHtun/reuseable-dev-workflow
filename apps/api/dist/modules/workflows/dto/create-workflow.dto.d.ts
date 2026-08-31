declare class WorkflowNodeDto {
  id: string;
  type: string;
  name: string;
  parameters: Record<string, unknown>;
}
declare class WorkflowEdgeDto {
  id: string;
  source: string;
  target: string;
}
declare class WorkflowDefinitionDto {
  nodes: WorkflowNodeDto[];
  edges: WorkflowEdgeDto[];
}
export declare class CreateWorkflowDto {
  name: string;
  description?: string;
  definition: WorkflowDefinitionDto;
}
export {};
