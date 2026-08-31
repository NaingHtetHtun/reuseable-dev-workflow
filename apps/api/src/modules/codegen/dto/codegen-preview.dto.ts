import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CodegenPreviewDto {
  @ApiProperty({
    description: 'Target framework',
    enum: ['typescript', 'laravel', 'nestjs'],
    example: 'typescript',
  })
  @IsString()
  @IsNotEmpty()
  framework!: string;

  @ApiPropertyOptional({
    description: 'Framework version',
    example: '5.0',
  })
  @IsOptional()
  @IsString()
  version?: string;

  @ApiPropertyOptional({
    description: 'Output directory prefix',
    example: 'src/types',
  })
  @IsOptional()
  @IsString()
  outputPrefix?: string;

  @ApiPropertyOptional({
    description: 'Include comments in generated code',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  includeComments?: boolean;
}
