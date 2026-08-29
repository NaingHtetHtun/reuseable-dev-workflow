import { IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';

export class CreateCredentialDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  type!: string;

  @IsObject()
  @IsNotEmpty()
  data!: Record<string, unknown>;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}
