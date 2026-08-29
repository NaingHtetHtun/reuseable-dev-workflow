import { IsOptional, IsString, IsIn } from 'class-validator';
import { PaginationDto } from '../../../shared/dto/pagination.dto';

export class WorkflowQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['draft', 'active', 'archived'])
  status?: string;
}
