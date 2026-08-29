import { NodeTypeDefinition, NodeHandler, NodeExecutionContext, NodeExecutionResult } from '../interfaces';
export declare const logDefinition: NodeTypeDefinition;
export declare class LogNodeHandler implements NodeHandler {
    readonly type = "log";
    execute(input: unknown, parameters: Record<string, unknown>, _context: NodeExecutionContext): Promise<NodeExecutionResult>;
}
//# sourceMappingURL=log.node.d.ts.map