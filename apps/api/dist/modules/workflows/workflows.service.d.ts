import { PrismaService } from '../../shared/database/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { CreateWorkflowDto, UpdateWorkflowDto, ExecuteWorkflowDto, WorkflowResponseDto, WorkflowQueryDto, ExecutionResponseDto } from './dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
export declare class WorkflowsService {
    private readonly prisma;
    private readonly projectsService;
    private readonly logger;
    private readonly executor;
    constructor(prisma: PrismaService, projectsService: ProjectsService);
    create(projectId: string, dto: CreateWorkflowDto): Promise<WorkflowResponseDto>;
    findAll(projectId: string, query: WorkflowQueryDto): Promise<{
        data: WorkflowResponseDto[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(projectId: string, id: string): Promise<WorkflowResponseDto>;
    update(projectId: string, id: string, dto: UpdateWorkflowDto): Promise<WorkflowResponseDto>;
    remove(projectId: string, id: string): Promise<void>;
    execute(projectId: string, id: string, dto: ExecuteWorkflowDto): Promise<ExecutionResponseDto>;
    findExecutions(projectId: string, workflowId: string, pagination: PaginationDto): Promise<{
        data: ExecutionResponseDto[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
}
