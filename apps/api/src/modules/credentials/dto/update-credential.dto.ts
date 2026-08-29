import { IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';

export class UpdateCredentialDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @IsObject()
  @IsOptional()
  data?: Record<string, unknown>;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}
