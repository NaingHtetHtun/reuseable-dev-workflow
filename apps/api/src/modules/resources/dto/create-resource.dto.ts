import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ResourceFieldDto {
  @ApiProperty({ description: 'Field name (snake_case)', example: 'display_name' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z][a-z0-9_]*$/, {
    message: 'Field name must be snake_case',
  })
  name!: string;

  @ApiProperty({ description: 'Display name', example: 'Display Name' })
  @IsString()
  @IsNotEmpty()
  displayName!: string;

  @ApiProperty({
    description: 'Field type',
    enum: [
      'string',
      'text',
      'boolean',
      'integer',
      'float',
      'timestamp',
      'json',
      'enum',
      'relation',
    ],
  })
  @IsString()
  @IsNotEmpty()
  type!: string;

  @ApiProperty({ description: 'Whether the field is required' })
  @IsNotEmpty()
  required!: boolean;

  @ApiPropertyOptional({ description: 'Whether the field is unique' })
  @IsOptional()
  unique?: boolean;

  @ApiPropertyOptional({ description: 'Default value' })
  @IsOptional()
  default?: unknown;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Min length (string/text)' })
  @IsOptional()
  minLength?: number;

  @ApiPropertyOptional({ description: 'Max length (string/text)' })
  @IsOptional()
  maxLength?: number;

  @ApiPropertyOptional({ description: 'Minimum value (integer/float)' })
  @IsOptional()
  minimum?: number;

  @ApiPropertyOptional({ description: 'Maximum value (integer/float)' })
  @IsOptional()
  maximum?: number;

  @ApiPropertyOptional({ description: 'Regex pattern (string)' })
  @IsOptional()
  @IsString()
  pattern?: string;

  @ApiPropertyOptional({ description: 'Enum values', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  enum?: string[];

  @ApiPropertyOptional({ description: 'Target resource name (relation)' })
  @IsOptional()
  @IsString()
  relationResource?: string;

  @ApiPropertyOptional({
    description: 'Relation type',
    enum: ['one-to-one', 'one-to-many', 'many-to-many'],
  })
  @IsOptional()
  @IsString()
  relationType?: string;
}

export class CreateResourceDto {
  @ApiProperty({
    description: 'Resource name (PascalCase)',
    example: 'Category',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z][a-zA-Z0-9]*$/, {
    message: 'Resource name must be PascalCase',
  })
  name!: string;

  @ApiProperty({
    description: 'Human-readable display name',
    example: 'Category',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  displayName!: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Table name override (default: snake_case of name)',
    example: 'categories',
  })
  @IsOptional()
  @IsString()
  tableName?: string;

  @ApiProperty({
    description: 'Resource fields',
    type: [ResourceFieldDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResourceFieldDto)
  fields!: ResourceFieldDto[];
}
