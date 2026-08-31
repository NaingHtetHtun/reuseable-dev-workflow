import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { ResourceStatus } from '@devflow/workflow-core';

export class ResourceResponseDto {
  @ApiProperty({ description: 'Resource ID' })
  id!: string;

  @ApiProperty({ description: 'Project ID' })
  projectId!: string;

  @ApiProperty({ description: 'Resource name' })
  name!: string;

  @ApiProperty({ description: 'Display name' })
  displayName!: string;

  @ApiPropertyOptional({ description: 'Description' })
  description?: string;

  @ApiPropertyOptional({ description: 'Table name override' })
  tableName?: string;

  @ApiProperty({ description: 'Version' })
  version!: string;

  @ApiProperty({ description: 'Status', enum: ['draft', 'published', 'deprecated'] })
  status!: ResourceStatus;

  @ApiProperty({ description: 'Fields', type: 'array', items: { type: 'object' } })
  fields!: Record<string, unknown>[];

  @ApiProperty({ description: 'Created timestamp' })
  createdAt!: Date;

  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt!: Date;
}
