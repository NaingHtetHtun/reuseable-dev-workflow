import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class AuthorizeDto {
  @IsString()
  @IsNotEmpty()
  projectId!: string;

  @IsArray()
  @IsOptional()
  scopes?: string[];

  @IsString()
  @IsOptional()
  redirectUri?: string;

  @IsString()
  @IsOptional()
  returnUrl?: string;

  @IsString()
  @IsOptional()
  credentialId?: string;
}
