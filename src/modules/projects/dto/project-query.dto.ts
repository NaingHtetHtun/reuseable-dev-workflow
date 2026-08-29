import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../shared/dto/pagination.dto';

export class ProjectQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;
}
