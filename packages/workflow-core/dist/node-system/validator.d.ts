import { NodeRegistry } from './registry';
import { WorkflowNode } from '../types';
import { ValidationResult } from './interfaces';
/** Validate a workflow node against the registry */
export declare function validateNode(node: WorkflowNode, registry: NodeRegistry): ValidationResult;
/** Validate all nodes in a workflow definition */
export declare function validateAllNodes(
  nodes: WorkflowNode[],
  registry: NodeRegistry,
): ValidationResult;
//# sourceMappingURL=validator.d.ts.map
