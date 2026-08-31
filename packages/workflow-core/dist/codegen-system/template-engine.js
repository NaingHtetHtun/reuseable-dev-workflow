/**
 * Simple string-based template engine with variable interpolation,
 * conditionals, and loops. No external dependencies.
 *
 * Syntax:
 * - Variable: {{variable}}
 * - Conditional: {{#if condition}}...{{/if}}
 * - Loop: {{#each items}}...{{/each}}
 * - Loop variable: {{this}} or {{this.property}}
 * - Loop index: {{@index}}
 */
export class TemplateEngine {
    /**
     * Render a template string with variable interpolation.
     */
    render(template, context) {
        let result = template;
        // Process loops first (they may contain variables)
        result = this.processLoops(result, context);
        // Process conditionals
        result = this.processConditionals(result, context);
        // Process variable interpolation
        result = this.interpolate(result, context);
        return result;
    }
    /**
     * Process {{#each items}}...{{/each}} blocks.
     * Supports nested {{#if}} and variable interpolation within the loop body
     * using the current item as context.
     */
    processLoops(template, context) {
        const eachRegex = /\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
        return template.replace(eachRegex, (_, key, body) => {
            const items = context[key];
            if (!Array.isArray(items)) {
                return '';
            }
            return items
                .map((item, index) => {
                // Build a merged context: top-level context + current item properties
                const itemContext = { ...context };
                if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') {
                    itemContext['this'] = item;
                }
                if (typeof item === 'object' && item !== null) {
                    const itemObj = item;
                    // Merge item properties into context so {{fieldName}} works directly
                    for (const [k, v] of Object.entries(itemObj)) {
                        itemContext[k] = v;
                    }
                    itemContext['this'] = item;
                }
                itemContext['@index'] = index;
                // Process conditionals within the loop body using item context
                let itemBody = this.processConditionals(body, itemContext);
                // Replace {{this.property}} with item properties
                if (typeof item === 'object' && item !== null) {
                    const itemObj = item;
                    itemBody = itemBody.replace(/\{\{this\.(\w+)\}\}/g, (_, prop) => String(itemObj[prop] ?? ''));
                }
                // Replace {{this}} with the item itself
                if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') {
                    itemBody = itemBody.replace(/\{\{this\}\}/g, String(item));
                }
                // Replace {{@index}} with the loop index
                itemBody = itemBody.replace(/\{\{@index\}\}/g, String(index));
                // Replace remaining variables in the loop body using item context
                itemBody = this.interpolate(itemBody, itemContext);
                return itemBody;
            })
                .join('');
        });
    }
    /**
     * Process {{#if condition}}...{{/if}} and {{#unless condition}}...{{/unless}} blocks.
     */
    processConditionals(template, context) {
        // Process {{#if}} blocks
        const ifRegex = /\{\{#if\s+([\w.]+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
        let result = template.replace(ifRegex, (_, key, body) => {
            const value = this.resolvePath(context, key);
            if (value && value !== 'false' && value !== '0' && value !== '') {
                return body;
            }
            return '';
        });
        // Process {{#unless}} blocks (inverse of if)
        const unlessRegex = /\{\{#unless\s+([\w.]+)\}\}([\s\S]*?)\{\{\/unless\}\}/g;
        result = result.replace(unlessRegex, (_, key, body) => {
            const value = this.resolvePath(context, key);
            if (!value || value === 'false' || value === '0' || value === '') {
                return body;
            }
            return '';
        });
        return result;
    }
    /**
     * Replace {{variable}} with values from context.
     */
    interpolate(template, context) {
        return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
            return this.resolvePath(context, path) ?? match;
        });
    }
    /**
     * Resolve a dotted path like 'a.b.c' against an object.
     */
    resolvePath(obj, path) {
        const parts = path.split('.');
        let current = obj;
        for (const part of parts) {
            if (current === null || current === undefined || typeof current !== 'object') {
                return undefined;
            }
            current = current[part];
        }
        if (current === undefined || current === null) {
            return undefined;
        }
        return String(current);
    }
}
//# sourceMappingURL=template-engine.js.map