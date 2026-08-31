import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsObject, IsOptional } from 'class-validator';
import type { PreviewOptions } from '@devflow/workflow-core';

export class NodePreviewDto {
  @ApiProperty({ description: 'Workflow definition containing the node' })
  @IsObject()
  definition!: Record<string, unknown>;

  @ApiProperty({ description: 'Node ID to preview' })
  @IsString()
  nodeId!: string;

  @ApiPropertyOptional({ description: 'Test input data for the node' })
  @IsOptional()
  @IsObject()
  input?: unknown;

  @ApiPropertyOptional({ description: 'Preview options' })
  @IsOptional()
  @IsObject()
  options?: Partial<PreviewOptions>;
}
