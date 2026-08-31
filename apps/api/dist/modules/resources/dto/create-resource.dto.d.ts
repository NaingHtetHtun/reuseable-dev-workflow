declare class ResourceFieldDto {
    name: string;
    displayName: string;
    type: string;
    required: boolean;
    unique?: boolean;
    default?: unknown;
    description?: string;
    minLength?: number;
    maxLength?: number;
    minimum?: number;
    maximum?: number;
    pattern?: string;
    enum?: string[];
    relationResource?: string;
    relationType?: string;
}
export declare class CreateResourceDto {
    name: string;
    displayName: string;
    description?: string;
    tableName?: string;
    fields: ResourceFieldDto[];
}
export {};
