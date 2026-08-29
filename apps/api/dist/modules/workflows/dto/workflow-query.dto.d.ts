import { PaginationDto } from '../../../shared/dto/pagination.dto';
export declare class WorkflowQueryDto extends PaginationDto {
    search?: string;
    status?: string;
}
