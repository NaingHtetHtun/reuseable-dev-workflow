import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsIn, MaxLength } from 'class-validator';
import type { ResourceStatus } from '@devflow/workflow-core';

export class UpdateResourceDto {
  @ApiPropertyOptional({ description: 'Human-readable display name' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  displayName?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Table name override' })
  @IsOptional()
  @IsString()
  tableName?: string;

  @ApiPropertyOptional({
    description: 'Resource status',
    enum: ['draft', 'published', 'deprecated'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['draft', 'published', 'deprecated'])
  status?: ResourceStatus;

  @ApiPropertyOptional({ description: 'Resource fields (replaces all fields)' })
  @IsOptional()
  @IsArray()
  fields?: Record<string, unknown>[];
}
