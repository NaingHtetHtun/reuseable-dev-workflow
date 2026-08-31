import { WorkflowsService } from './workflows.service';
import { CreateWorkflowDto, UpdateWorkflowDto, ExecuteWorkflowDto, WorkflowQueryDto } from './dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
export declare class WorkflowsController {
    private readonly workflowsService;
    constructor(workflowsService: WorkflowsService);
    create(projectId: string, dto: CreateWorkflowDto): Promise<import("./dto").WorkflowResponseDto>;
    findAll(projectId: string, query: WorkflowQueryDto): Promise<{
        data: import("./dto").WorkflowResponseDto[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(projectId: string, id: string): Promise<import("./dto").WorkflowResponseDto>;
    update(projectId: string, id: string, dto: UpdateWorkflowDto): Promise<import("./dto").WorkflowResponseDto>;
    remove(projectId: string, id: string): Promise<void>;
    execute(projectId: string, id: string, dto: ExecuteWorkflowDto): Promise<import("./dto").ExecutionResponseDto>;
    findExecutions(projectId: string, id: string, pagination: PaginationDto): Promise<{
        data: import("./dto").ExecutionResponseDto[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
}
