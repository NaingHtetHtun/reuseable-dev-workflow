import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto, ProjectQueryDto } from './dto';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    create(dto: CreateProjectDto): Promise<import("./dto").ProjectResponseDto>;
    findAll(query: ProjectQueryDto): Promise<{
        data: import("./dto").ProjectResponseDto[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<import("./dto").ProjectResponseDto>;
    update(id: string, dto: UpdateProjectDto): Promise<import("./dto").ProjectResponseDto>;
    remove(id: string): Promise<void>;
}
