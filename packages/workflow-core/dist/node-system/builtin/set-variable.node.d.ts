import {
  NodeTypeDefinition,
  NodeHandler,
  NodeExecutionContext,
  NodeExecutionResult,
} from '../interfaces';
export declare const setVariableDefinition: NodeTypeDefinition;
export declare class SetVariableNodeHandler implements NodeHandler {
  readonly type = 'set-variable';
  execute(
    input: unknown,
    parameters: Record<string, unknown>,
    _context: NodeExecutionContext,
  ): Promise<NodeExecutionResult>;
}
//# sourceMappingURL=set-variable.node.d.ts.map
