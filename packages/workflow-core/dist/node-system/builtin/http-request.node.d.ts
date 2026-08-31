import { NodeTypeDefinition, NodeHandler, NodeExecutionContext, NodeExecutionResult, ValidationResult } from '../interfaces';
export declare const httpRequestDefinition: NodeTypeDefinition;
export declare class HttpRequestNodeHandler implements NodeHandler {
    readonly type = "http-request";
    execute(input: unknown, parameters: Record<string, unknown>, _context: NodeExecutionContext): Promise<NodeExecutionResult>;
    validate(parameters: Record<string, unknown>): ValidationResult;
}
//# sourceMappingURL=http-request.node.d.ts.map