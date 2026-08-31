import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import {
  Compiler,
  TypeScriptAdapter,
  type ApplicationDefinition,
  type CompilationResult,
  type Framework,
  type ResourceFieldForCodegen,
} from '@devflow/workflow-core';
import { CodegenPreviewDto } from './dto';

@Injectable()
export class CodegenService {
  private readonly logger = new Logger(CodegenService.name);
  private readonly compiler: Compiler;

  constructor(private readonly prisma: PrismaService) {
    this.compiler = new Compiler();
    this.compiler.registerAdapter(new TypeScriptAdapter());
  }

  /**
   * Preview generated code for all resources in a project.
   */
  async previewProject(projectId: string, dto: CodegenPreviewDto): Promise<CompilationResult> {
    const resources = await this.prisma.resource.findMany({
      where: { projectId },
      orderBy: { name: 'asc' },
    });

    if (resources.length === 0) {
      return {
        success: true,
        files: [],
        warnings: ['No resources found in this project'],
        errors: [],
        metadata: {
          framework: dto.framework as Framework,
          version: dto.version,
          resourceCount: 0,
          componentCount: 0,
          fileCount: 0,
          generatedAt: new Date(),
        },
      };
    }

    const definition = this.buildDefinition(projectId, resources);
    return this.compiler.compile(definition, {
      framework: dto.framework as Framework,
      version: dto.version,
      outputPrefix: dto.outputPrefix,
      includeComments: dto.includeComments ?? true,
    });
  }

  /**
   * Preview generated code for a single resource.
   */
  async previewResource(
    projectId: string,
    resourceId: string,
    dto: CodegenPreviewDto,
  ): Promise<CompilationResult> {
    const resource = await this.prisma.resource.findFirst({
      where: { id: resourceId, projectId },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    const definition = this.buildDefinition(projectId, [resource]);
    return this.compiler.compile(definition, {
      framework: dto.framework as Framework,
      version: dto.version,
      outputPrefix: dto.outputPrefix,
      includeComments: dto.includeComments ?? true,
    });
  }

  /**
   * Get available frameworks.
   */
  getAvailableFrameworks(): string[] {
    return this.compiler.getAvailableFrameworks();
  }

  /**
   * Build an ApplicationDefinition from Prisma resources.
   */
  private buildDefinition(
    projectId: string,
    resources: Array<{
      name: string;
      displayName: string;
      description: string | null;
      tableName: string | null;
      fields: unknown;
    }>,
  ): ApplicationDefinition {
    return {
      name: projectId,
      resources: resources.map((r) => ({
        name: r.name,
        displayName: r.displayName,
        description: r.description ?? undefined,
        tableName: r.tableName ?? undefined,
        fields: r.fields as unknown as ResourceFieldForCodegen[],
      })),
      components: [],
    };
  }
}
