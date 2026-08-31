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
export declare class TemplateEngine {
    /**
     * Render a template string with variable interpolation.
     */
    render(template: string, context: Record<string, unknown>): string;
    /**
     * Process {{#each items}}...{{/each}} blocks.
     * Supports nested {{#if}} and variable interpolation within the loop body
     * using the current item as context.
     */
    private processLoops;
    /**
     * Process {{#if condition}}...{{/if}} and {{#unless condition}}...{{/unless}} blocks.
     */
    private processConditionals;
    /**
     * Replace {{variable}} with values from context.
     */
    private interpolate;
    /**
     * Resolve a dotted path like 'a.b.c' against an object.
     */
    private resolvePath;
}
//# sourceMappingURL=template-engine.d.ts.map