export function validateWorkflowDefinition(definition) {
    const errors = [];
    if (!definition.nodes || definition.nodes.length === 0) {
        errors.push('Workflow must have at least one node');
        return { valid: false, errors };
    }
    if (!definition.edges) {
        definition.edges = [];
    }
    // Check for duplicate node IDs
    const nodeIds = new Set();
    for (const node of definition.nodes) {
        if (nodeIds.has(node.id)) {
            errors.push(`Duplicate node ID: ${node.id}`);
        }
        nodeIds.add(node.id);
    }
    // Check for duplicate edge IDs
    const edgeIds = new Set();
    for (const edge of definition.edges) {
        if (edgeIds.has(edge.id)) {
            errors.push(`Duplicate edge ID: ${edge.id}`);
        }
        edgeIds.add(edge.id);
    }
    // Check edge references
    for (const edge of definition.edges) {
        if (!nodeIds.has(edge.source)) {
            errors.push(`Edge "${edge.id}" references non-existent source node: ${edge.source}`);
        }
        if (!nodeIds.has(edge.target)) {
            errors.push(`Edge "${edge.id}" references non-existent target node: ${edge.target}`);
        }
        if (edge.source === edge.target) {
            errors.push(`Edge "${edge.id}" creates a self-loop on node: ${edge.source}`);
        }
    }
    // Check for cycles (DFS-based)
    if (hasCycle(definition)) {
        errors.push('Workflow contains a cycle');
    }
    // Check for single start node (node with no incoming edges)
    const nodesWithIncomingEdges = new Set();
    for (const edge of definition.edges) {
        nodesWithIncomingEdges.add(edge.target);
    }
    const startNodes = definition.nodes.filter((node) => !nodesWithIncomingEdges.has(node.id));
    if (startNodes.length === 0) {
        errors.push('Workflow has no start node (all nodes have incoming edges)');
    }
    else if (startNodes.length > 1) {
        errors.push(`Workflow has multiple start nodes: ${startNodes.map((n) => n.id).join(', ')}`);
    }
    return { valid: errors.length === 0, errors };
}
function hasCycle(definition) {
    const adjacencyList = new Map();
    for (const node of definition.nodes) {
        adjacencyList.set(node.id, []);
    }
    for (const edge of definition.edges) {
        const targets = adjacencyList.get(edge.source);
        if (targets) {
            targets.push(edge.target);
        }
    }
    const visited = new Set();
    const inStack = new Set();
    function dfs(nodeId) {
        visited.add(nodeId);
        inStack.add(nodeId);
        const neighbors = adjacencyList.get(nodeId) ?? [];
        for (const neighbor of neighbors) {
            if (inStack.has(neighbor)) {
                return true; // Cycle found
            }
            if (!visited.has(neighbor)) {
                if (dfs(neighbor)) {
                    return true;
                }
            }
        }
        inStack.delete(nodeId);
        return false;
    }
    for (const node of definition.nodes) {
        if (!visited.has(node.id)) {
            if (dfs(node.id)) {
                return true;
            }
        }
    }
    return false;
}
//# sourceMappingURL=validator.js.map