import { ComponentsService } from './components.service';
import { CreateComponentDto, UpdateComponentDto } from './dto';
import type { ComponentStatus } from '@devflow/workflow-core';
export declare class ComponentsController {
    private readonly componentsService;
    constructor(componentsService: ComponentsService);
    create(projectId: string, dto: CreateComponentDto): Promise<import("./dto").ComponentResponseDto>;
    findAll(projectId: string, page?: string, limit?: string, search?: string, category?: string, status?: ComponentStatus): Promise<{
        data: import("./dto").ComponentResponseDto[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(projectId: string, id: string): Promise<import("./dto").ComponentResponseDto>;
    update(projectId: string, id: string, dto: UpdateComponentDto): Promise<import("./dto").ComponentResponseDto>;
    remove(projectId: string, id: string): Promise<void>;
    createVersion(projectId: string, id: string, body: {
        version: string;
        changelog?: string;
    }): Promise<import("@devflow/workflow-core").ComponentVersion>;
    listVersions(projectId: string, id: string): Promise<import("@devflow/workflow-core").ComponentVersion[]>;
    getVersion(projectId: string, id: string, version: string): Promise<import("@devflow/workflow-core").ComponentVersion>;
    clone(projectId: string, id: string, body: {
        name: string;
    }): Promise<import("./dto").ComponentResponseDto>;
}
