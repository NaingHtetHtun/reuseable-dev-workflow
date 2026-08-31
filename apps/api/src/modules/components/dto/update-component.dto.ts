import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsObject, IsIn, MaxLength } from 'class-validator';
import type { ComponentStatus } from '@devflow/workflow-core';

export class UpdateComponentDto {
  @ApiPropertyOptional({
    description: 'Human-readable display name',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  displayName?: string;

  @ApiPropertyOptional({
    description: 'Detailed description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Component status',
    enum: ['draft', 'published', 'deprecated'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['draft', 'published', 'deprecated'])
  status?: ComponentStatus;

  @ApiPropertyOptional({
    description: 'Category for grouping',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Tags for search and filtering',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Author name or identifier',
  })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiPropertyOptional({
    description: 'Configuration schema',
  })
  @IsOptional()
  @IsObject()
  configSchema?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Credential schema',
  })
  @IsOptional()
  @IsObject()
  credentialSchema?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Input schema',
  })
  @IsOptional()
  @IsObject()
  inputSchema?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Output schema',
  })
  @IsOptional()
  @IsObject()
  outputSchema?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Component implementation',
  })
  @IsOptional()
  @IsObject()
  implementation?: Record<string, unknown>;
}
