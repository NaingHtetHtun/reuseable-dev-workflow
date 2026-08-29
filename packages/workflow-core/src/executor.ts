import { WorkflowDefinition, WorkflowNode, ExecutionContext } from './types';
import { validateWorkflowDefinition } from './validator';
import { NodeRegistry } from './node-system/registry';
import { NodeExecutionContext } from './node-system/interfaces';
import { Logger, noopLogger } from './logger.interface';
import {
  logDefinition,
  LogNodeHandler,
  setVariableDefinition,
  SetVariableNodeHandler,
  noOpDefinition,
  NoOpNodeHandler,
  httpRequestDefinition,
  HttpRequestNodeHandler,
  delayDefinition,
  DelayNodeHandler,
} from './node-system/builtin';

export interface ExecutionResult {
  status: 'completed' | 'failed';
  output: unknown;
  error: string | null;
  nodeResults: Record<string, unknown>;
}

/** Function that resolves a credential ID to its decrypted data */
export type CredentialResolver = (id: string) => Promise<Record<string, unknown>>;

export class WorkflowExecutor {
  private readonly logger: Logger;
  private readonly registry: NodeRegistry;
  private readonly credentialResolver?: CredentialResolver;

  constructor(logger?: Logger, credentialResolver?: CredentialResolver) {
    this.logger = logger ?? noopLogger;
    this.credentialResolver = credentialResolver;
    this.registry = this.createDefaultRegistry();
  }

  getRegistry(): NodeRegistry {
    return this.registry;
  }

  async execute(
    workflowId: string,
    executionId: string,
    definition: WorkflowDefinition,
    input: unknown,
  ): Promise<ExecutionResult> {
    // Validate definition
    const validation = validateWorkflowDefinition(definition);
    if (!validation.valid) {
      return {
        status: 'failed',
        output: null,
        error: `Invalid workflow definition: ${validation.errors.join('; ')}`,
        nodeResults: {},
      };
    }

    // Build execution context
    const context: ExecutionContext = {
      workflowId,
      executionId,
      input,
      nodeResults: new Map(),
      currentNodeId: '',
      startedAt: new Date(),
    };

    // Get topologically sorted nodes
    const sortedNodes = this.topologicalSort(definition);

    // Execute nodes sequentially
    for (const node of sortedNodes) {
      context.currentNodeId = node.id;

      try {
        const nodeInput = this.getNodeInput(node, context);
        const output = await this.executeNode(node, nodeInput, context);
        context.nodeResults.set(node.id, output);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(
          `Node "${node.id}" failed: ${errorMessage}`,
          error instanceof Error ? error.stack : undefined,
        );

        return {
          status: 'failed',
          output: null,
          error: `Node "${node.id}" failed: ${errorMessage}`,
          nodeResults: Object.fromEntries(context.nodeResults),
        };
      }
    }

    // Get final output (last node's output)
    const lastNode = sortedNodes[sortedNodes.length - 1];
    const output = lastNode ? (context.nodeResults.get(lastNode.id) ?? null) : null;

    return {
      status: 'completed',
      output,
      error: null,
      nodeResults: Object.fromEntries(context.nodeResults),
    };
  }

  private getNodeInput(node: WorkflowNode, context: ExecutionContext): unknown {
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

  private async executeNode(
    node: WorkflowNode,
    input: unknown,
    context: ExecutionContext,
  ): Promise<unknown> {
    const handler = this.registry.getHandler(node.type);
    if (!handler) {
      throw new Error(`Unknown node type: ${node.type}`);
    }

    const nodeContext: NodeExecutionContext = {
      workflowId: context.workflowId,
      executionId: context.executionId,
      nodeId: node.id,
      nodeResults: context.nodeResults,
      startedAt: context.startedAt,
      resolveCredential: this.credentialResolver
        ? (id: string) => this.credentialResolver!(id)
        : undefined,
    };

    const result = await handler.execute(input, node.parameters, nodeContext);
    return result.output;
  }

  private createDefaultRegistry(): NodeRegistry {
    const registry = new NodeRegistry();

    registry.register(logDefinition, new LogNodeHandler());
    registry.register(setVariableDefinition, new SetVariableNodeHandler());
    registry.register(noOpDefinition, new NoOpNodeHandler());
    registry.register(httpRequestDefinition, new HttpRequestNodeHandler());
    registry.register(delayDefinition, new DelayNodeHandler());

    return registry;
  }

  private topologicalSort(definition: WorkflowDefinition): WorkflowNode[] {
    const nodeMap = new Map(definition.nodes.map((n) => [n.id, n]));
    const inDegree = new Map<string, number>();
    const adjacencyList = new Map<string, string[]>();

    for (const node of definition.nodes) {
      inDegree.set(node.id, 0);
      adjacencyList.set(node.id, []);
    }

    for (const edge of definition.edges) {
      inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
      adjacencyList.get(edge.source)?.push(edge.target);
    }

    const queue: string[] = [];
    for (const [nodeId, degree] of inDegree) {
      if (degree === 0) {
        queue.push(nodeId);
      }
    }

    const sorted: WorkflowNode[] = [];
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
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
