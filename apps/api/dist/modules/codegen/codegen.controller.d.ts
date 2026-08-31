import { CodegenService } from './codegen.service';
import { CodegenPreviewDto } from './dto';
export declare class CodegenController {
  private readonly codegenService;
  constructor(codegenService: CodegenService);
  previewProject(
    projectId: string,
    dto: CodegenPreviewDto,
  ): Promise<import('@devflow/workflow-core').CompilationResult>;
  previewResource(
    projectId: string,
    resourceId: string,
    dto: CodegenPreviewDto,
  ): Promise<import('@devflow/workflow-core').CompilationResult>;
  listFrameworks(): Promise<{
    frameworks: string[];
  }>;
}
