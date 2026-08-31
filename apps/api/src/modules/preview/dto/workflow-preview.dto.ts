import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsIn, IsOptional, IsObject } from 'class-validator';
import type { PreviewMode, PreviewOptions } from '@devflow/workflow-core';

export class PreviewOptionsDto implements PreviewOptions {
  @ApiPropertyOptional({ description: 'Maximum execution time in ms', default: 30000 })
  @IsOptional()
  timeoutMs?: number;

  @ApiPropertyOptional({ description: 'Whether to actually execute HTTP requests', default: false })
  @IsOptional()
  executeHttp?: boolean;

  @ApiPropertyOptional({ description: 'Whether to execute delays', default: false })
  @IsOptional()
  executeDelays?: boolean;

  @ApiPropertyOptional({ description: 'Maximum nodes to execute' })
  @IsOptional()
  maxNodes?: number;
}

export class WorkflowPreviewDto {
  @ApiProperty({ description: 'Workflow definition to preview' })
  @IsObject()
  definition!: Record<string, unknown>;

  @ApiProperty({
    description: 'Preview mode',
    enum: ['validate', 'dry-run', 'execute', 'step'],
    default: 'validate',
  })
  @IsString()
  @IsIn(['validate', 'dry-run', 'execute', 'step'])
  mode!: PreviewMode;

  @ApiPropertyOptional({ description: 'Test input data' })
  @IsOptional()
  @IsObject()
  input?: unknown;

  @ApiPropertyOptional({ description: 'Node ID to preview (for step mode)' })
  @IsOptional()
  @IsString()
  nodeId?: string;

  @ApiPropertyOptional({ description: 'Preview options', type: PreviewOptionsDto })
  @IsOptional()
  @IsObject()
  options?: PreviewOptionsDto;
}
