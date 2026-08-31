import { validateWorkflowDefinition } from '../validator';
import { noopLogger } from '../logger.interface';
import { createPreviewRegistry } from './node-mock-registry';
const DEFAULT_TIMEOUT_MS = 30_000;
/**
 * Executes workflow previews in a sandboxed context.
 * Supports validation, dry-run, execute, and step-through modes.
 */
export class PreviewExecutor {
    logger;
    constructor(logger) {
        this.logger = logger ?? noopLogger;
    }
    /**
     * Execute a workflow preview.
     */
    async preview(request) {
        const startTime = Date.now();
        const options = {
            timeoutMs: DEFAULT_TIMEOUT_MS,
            ...request.options,
        };
        // Step 1: Validate definition
        const validation = validateWorkflowDefinition(request.definition);
        if (!validation.valid) {
            return {
                success: false,
                mode: request.mode,
                validationErrors: validation.errors,
                nodeResults: [],
                output: null,
                durationMs: Date.now() - startTime,
                warnings: [],
            };
        }
        // Step 2: Execute based on mode
        switch (request.mode) {
            case 'validate':
                return this.validateOnly(request, startTime);
            case 'dry-run':
                return this.dryRun(request, options, startTime);
            case 'execute':
                return this.executeWorkflow(request, options, startTime);
            case 'step':
                return this.executeWorkflow(request, options, startTime);
            default:
                return {
                    success: false,
                    mode: request.mode,
                    validationErrors: [`Unknown preview mode: ${request.mode}`],
                    nodeResults: [],
                    output: null,
                    durationMs: Date.now() - startTime,
                    warnings: [],
                };
        }
    }
    /**
     * Preview a single node.
     */
    async previewNode(definition, nodeId, input, options) {
        const startTime = Date.now();
        // Find the node
        const node = definition.nodes.find((n) => n.id === nodeId);
        if (!node) {
            return {
                nodeId,
                nodeType: 'unknown',
                nodeName: 'unknown',
                input,
                output: null,
                success: false,
                error: `Node not found: ${nodeId}`,
                durationMs: 0,
            };
        }
        // Create preview registry
        const registry = createPreviewRegistry(options);
        const handler = registry.getHandler(node.type);
        if (!handler) {
            return {
                nodeId: node.id,
                nodeType: node.type,
                nodeName: node.name,
                input,
                output: null,
                success: false,
                error: `Unknown node type: ${node.type}`,
                durationMs: Date.now() - startTime,
            };
        }
        // Execute single node
        try {
            const nodeContext = {
                workflowId: 'preview',
                executionId: `preview-${Date.now()}`,
                input,
                nodeResults: new Map(),
                currentNodeId: node.id,
                startedAt: new Date(),
            };
            const result = await handler.execute(input, node.parameters, {
                workflowId: nodeContext.workflowId,
                executionId: nodeContext.executionId,
                nodeId: node.id,
                nodeResults: nodeContext.nodeResults,
                startedAt: nodeContext.startedAt,
            });
            return {
                nodeId: node.id,
                nodeType: node.type,
                nodeName: node.name,
                input,
                output: result.output,
                success: true,
                durationMs: Date.now() - startTime,
            };
        }
        catch (error) {
            return {
                nodeId: node.id,
                nodeType: node.type,
                nodeName: node.name,
                input,
                output: null,
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                durationMs: Date.now() - startTime,
            };
        }
    }
    validateOnly(request, startTime) {
        const validation = validateWorkflowDefinition(request.definition);
        return {
            success: validation.valid,
            mode: 'validate',
            validationErrors: validation.errors,
            nodeResults: [],
            output: null,
            durationMs: Date.now() - startTime,
            warnings: [],
        };
    }
    dryRun(request, options, startTime) {
        const warnings = [];
        const nodeResults = [];
        // Apply maxNodes limit
        const nodes = options.maxNodes
            ? request.definition.nodes.slice(0, options.maxNodes)
            : request.definition.nodes;
        if (options.maxNodes && request.definition.nodes.length > options.maxNodes) {
            warnings.push(`Only ${options.maxNodes} of ${request.definition.nodes.length} nodes included (maxNodes limit)`);
        }
        for (const node of nodes) {
            nodeResults.push({
                nodeId: node.id,
                nodeType: node.type,
                nodeName: node.name,
                input: null,
                output: null,
                success: true,
                durationMs: 0,
            });
            // Check for potential issues
            if (node.type === 'http-request') {
                warnings.push(`Node "${node.id}" will make HTTP requests in production`);
            }
            if (node.type === 'delay') {
                warnings.push(`Node "${node.id}" will introduce delays in production`);
            }
        }
        return {
            success: true,
            mode: 'dry-run',
            validationErrors: [],
            nodeResults,
            output: null,
            durationMs: Date.now() - startTime,
            warnings,
        };
    }
    async executeWorkflow(request, options, startTime) {
        const warnings = [];
        // Create preview-specific executor with mock registry
        const previewRegistry = createPreviewRegistry(options);
        const executionId = `preview-${Date.now()}`;
        // Build execution context
        const context = {
            workflowId: 'preview',
            executionId,
            input: request.input ?? {},
            nodeResults: new Map(),
            currentNodeId: '',
            startedAt: new Date(),
        };
        // Get topologically sorted nodes
        const sortedNodes = this.topologicalSort(request.definition);
        // Apply maxNodes limit
        const nodesToExecute = options.maxNodes ? sortedNodes.slice(0, options.maxNodes) : sortedNodes;
        if (options.maxNodes && sortedNodes.length > options.maxNodes) {
            warnings.push(`Only ${options.maxNodes} of ${sortedNodes.length} nodes executed (maxNodes limit)`);
        }
        // Execute nodes sequentially
        const nodeResults = [];
        let finalStatus = 'completed';
        let finalError = null;
        for (const node of nodesToExecute) {
            context.currentNodeId = node.id;
            const nodeStartTime = Date.now();
            try {
                const handler = previewRegistry.getHandler(node.type);
                if (!handler) {
                    throw new Error(`Unknown node type: ${node.type}`);
                }
                const nodeInput = this.getNodeInput(node, context);
                const result = await handler.execute(nodeInput, node.parameters, {
                    workflowId: context.workflowId,
                    executionId: context.executionId,
                    nodeId: node.id,
                    nodeResults: context.nodeResults,
                    startedAt: context.startedAt,
                });
                context.nodeResults.set(node.id, result.output);
                nodeResults.push({
                    nodeId: node.id,
                    nodeType: node.type,
                    nodeName: node.name,
                    input: nodeInput,
                    output: result.output,
                    success: true,
                    durationMs: Date.now() - nodeStartTime,
                });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                finalStatus = 'failed';
                finalError = `Node "${node.id}" failed: ${errorMessage}`;
                nodeResults.push({
                    nodeId: node.id,
                    nodeType: node.type,
                    nodeName: node.name,
                    input: null,
                    output: null,
                    success: false,
                    error: errorMessage,
                    durationMs: Date.now() - nodeStartTime,
                });
                this.logger.error(finalError);
                break;
            }
        }
        // Get final output
        const lastNode = nodesToExecute[nodesToExecute.length - 1];
        const output = lastNode ? (context.nodeResults.get(lastNode.id) ?? null) : null;
        return {
            success: finalStatus === 'completed',
            mode: request.mode,
            validationErrors: finalError ? [finalError] : [],
            nodeResults,
            output,
            durationMs: Date.now() - startTime,
            warnings,
        };
    }
    getNodeInput(node, context) {
        if (context.nodeResults.size === 0) {
            return context.input;
        }
        for (const [nodeId, result] of context.nodeResults) {
            if (nodeId !== node.id) {
                return result;
            }
        }
        return context.input;
    }
    topologicalSort(definition) {
        const nodeMap = new Map(definition.nodes.map((n) => [n.id, n]));
        const inDegree = new Map();
        const adjacencyList = new Map();
        for (const node of definition.nodes) {
            inDegree.set(node.id, 0);
            adjacencyList.set(node.id, []);
        }
        for (const edge of definition.edges) {
            inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
            adjacencyList.get(edge.source)?.push(edge.target);
        }
        const queue = [];
        for (const [nodeId, degree] of inDegree) {
            if (degree === 0) {
                queue.push(nodeId);
            }
        }
        const sorted = [];
        while (queue.length > 0) {
            const nodeId = queue.shift();
            const node = nodeMap.get(nodeId);
            if (node) {
                sorted.push(node);
            }
            for (const neighbor of adjacencyList.get(nodeId) ?? []) {
                const newDegree = (inDegree.get(neighbor) ?? 1) - 1;
                inDegree.set(neighbor, newDegree);
                if (newDegree === 0) {
                    queue.push(neighbor);
                }
            }
        }
        return sorted;
    }
}
//# sourceMappingURL=preview-executor.js.map