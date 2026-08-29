import { NodeTypeDefinition, NodeHandler, NodeExecutionContext, NodeExecutionResult } from '../interfaces';
export declare const delayDefinition: NodeTypeDefinition;
export declare class DelayNodeHandler implements NodeHandler {
    readonly type = "delay";
    execute(input: unknown, parameters: Record<string, unknown>, _context: NodeExecutionContext): Promise<NodeExecutionResult>;
}
//# sourceMappingURL=delay.node.d.ts.map