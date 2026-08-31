import { ResourcesService } from './resources.service';
import { CreateResourceDto, UpdateResourceDto } from './dto';
import type { ResourceStatus } from '@devflow/workflow-core';
export declare class ResourcesController {
    private readonly resourcesService;
    constructor(resourcesService: ResourcesService);
    create(projectId: string, dto: CreateResourceDto): Promise<import("./dto").ResourceResponseDto>;
    findAll(projectId: string, page?: string, limit?: string, search?: string, status?: ResourceStatus): Promise<{
        data: import("./dto").ResourceResponseDto[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(projectId: string, id: string): Promise<import("./dto").ResourceResponseDto>;
    update(projectId: string, id: string, dto: UpdateResourceDto): Promise<import("./dto").ResourceResponseDto>;
    remove(projectId: string, id: string): Promise<void>;
    createVersion(projectId: string, id: string, body: {
        version: string;
        changelog?: string;
    }): Promise<import("@devflow/workflow-core").ResourceVersion>;
    listVersions(projectId: string, id: string): Promise<import("@devflow/workflow-core").ResourceVersion[]>;
    getVersion(projectId: string, id: string, version: string): Promise<import("@devflow/workflow-core").ResourceVersion>;
    generatePrisma(projectId: string, id: string): Promise<{
        prisma: string;
    }>;
    generateValidation(projectId: string, id: string, body: {
        operation: 'create' | 'update' | 'response';
    }): Promise<{
        dto: string;
    }>;
}
