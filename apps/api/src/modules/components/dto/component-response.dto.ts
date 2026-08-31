import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { ComponentStatus } from '@devflow/workflow-core';

export class ComponentResponseDto {
  @ApiProperty({ description: 'Component ID' })
  id!: string;

  @ApiProperty({ description: 'Project ID' })
  projectId!: string;

  @ApiProperty({ description: 'Component name' })
  name!: string;

  @ApiProperty({ description: 'Display name' })
  displayName!: string;

  @ApiPropertyOptional({ description: 'Description' })
  description?: string;

  @ApiProperty({ description: 'Version' })
  version!: string;

  @ApiProperty({ description: 'Status', enum: ['draft', 'published', 'deprecated'] })
  status!: ComponentStatus;

  @ApiPropertyOptional({ description: 'Category' })
  category?: string;

  @ApiProperty({ description: 'Tags', type: [String] })
  tags!: string[];

  @ApiPropertyOptional({ description: 'Author' })
  author?: string;

  @ApiProperty({ description: 'Created timestamp' })
  createdAt!: Date;

  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt!: Date;
}
