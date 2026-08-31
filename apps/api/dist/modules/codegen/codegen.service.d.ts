import { PrismaService } from '../../shared/database/prisma.service';
import { type CompilationResult } from '@devflow/workflow-core';
import { CodegenPreviewDto } from './dto';
export declare class CodegenService {
  private readonly prisma;
  private readonly logger;
  private readonly compiler;
  constructor(prisma: PrismaService);
  previewProject(projectId: string, dto: CodegenPreviewDto): Promise<CompilationResult>;
  previewResource(
    projectId: string,
    resourceId: string,
    dto: CodegenPreviewDto,
  ): Promise<CompilationResult>;
  getAvailableFrameworks(): string[];
  private buildDefinition;
}
