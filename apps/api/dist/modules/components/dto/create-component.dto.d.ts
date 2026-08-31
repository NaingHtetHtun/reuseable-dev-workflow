export declare class CreateComponentDto {
    name: string;
    displayName: string;
    description?: string;
    category?: string;
    tags?: string[];
    author?: string;
    configSchema?: Record<string, unknown>;
    credentialSchema?: Record<string, unknown>;
    inputSchema?: Record<string, unknown>;
    outputSchema?: Record<string, unknown>;
    implementation?: Record<string, unknown>;
}
