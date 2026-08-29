/** Validate a workflow node against the registry */
export function validateNode(node, registry) {
    const errors = [];
    // Check node type is registered
    if (!registry.hasType(node.type)) {
        errors.push(`Unknown node type: ${node.type}`);
        return { valid: false, errors };
    }
    // Validate parameters against schema
    const paramResult = registry.validateParameters(node.type, node.parameters);
    if (!paramResult.valid) {
        errors.push(...paramResult.errors);
    }
    // Run custom validation if handler provides it
    const handler = registry.getHandler(node.type);
    if (handler?.validate) {
        const customResult = handler.validate(node.parameters);
        if (!customResult.valid) {
            errors.push(...customResult.errors);
        }
    }
    return { valid: errors.length === 0, errors };
}
/** Validate all nodes in a workflow definition */
export function validateAllNodes(nodes, registry) {
    const errors = [];
    for (const node of nodes) {
        const result = validateNode(node, registry);
        if (!result.valid) {
            errors.push(`Node "${node.id}" (${node.type}): ${result.errors.join('; ')}`);
        }
    }
    return { valid: errors.length === 0, errors };
}
//# sourceMappingURL=validator.js.map