import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsObject,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateComponentDto {
  @ApiProperty({
    description: 'Component name (lowercase, numbers, hyphens only)',
    example: 'google-login',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Name must contain only lowercase letters, numbers, and hyphens',
  })
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    description: 'Human-readable display name',
    example: 'Google Login',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  displayName!: string;

  @ApiPropertyOptional({
    description: 'Detailed description of what the component does',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Category for grouping',
    example: 'auth',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Tags for search and filtering',
    example: ['google', 'oauth', 'login'],
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
    description: 'Configuration schema for user-configurable options',
  })
  @IsOptional()
  @IsObject()
  configSchema?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Credential schema for required credentials',
  })
  @IsOptional()
  @IsObject()
  credentialSchema?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Input schema for accepted data',
  })
  @IsOptional()
  @IsObject()
  inputSchema?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Output schema for produced data',
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
