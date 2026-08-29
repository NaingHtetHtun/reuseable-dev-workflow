import { IsOptional, IsObject } from 'class-validator';

export class ExecuteWorkflowDto {
  @IsOptional()
  @IsObject()
  input?: Record<string, unknown>;
}
