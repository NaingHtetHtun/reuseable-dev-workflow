import {
  NodeTypeDefinition,
  NodeHandler,
  NodeExecutionContext,
  NodeExecutionResult,
} from '../interfaces';
export declare const noOpDefinition: NodeTypeDefinition;
export declare class NoOpNodeHandler implements NodeHandler {
  readonly type = 'no-op';
  execute(
    input: unknown,
    _parameters: Record<string, unknown>,
    _context: NodeExecutionContext,
  ): Promise<NodeExecutionResult>;
}
//# sourceMappingURL=no-op.node.d.ts.map
