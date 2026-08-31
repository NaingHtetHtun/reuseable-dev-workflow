import { Controller, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CodegenService } from './codegen.service';
import { CodegenPreviewDto } from './dto';

@ApiTags('codegen')
@Controller('api/v1/projects/:projectId/codegen')
export class CodegenController {
  constructor(private readonly codegenService: CodegenService) {}

  @Post('preview')
  @ApiOperation({ summary: 'Preview generated code for all project resources' })
  @ApiResponse({ status: 200, description: 'Generated code preview' })
  async previewProject(@Param('projectId') projectId: string, @Body() dto: CodegenPreviewDto) {
    return this.codegenService.previewProject(projectId, dto);
  }

  @Post('preview/:resourceId')
  @ApiOperation({ summary: 'Preview generated code for a single resource' })
  @ApiResponse({ status: 200, description: 'Generated code preview' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async previewResource(
    @Param('projectId') projectId: string,
    @Param('resourceId') resourceId: string,
    @Body() dto: CodegenPreviewDto,
  ) {
    return this.codegenService.previewResource(projectId, resourceId, dto);
  }

  @Post('frameworks')
  @ApiOperation({ summary: 'List available code generation frameworks' })
  @ApiResponse({ status: 200, description: 'List of available frameworks' })
  async listFrameworks() {
    return { frameworks: this.codegenService.getAvailableFrameworks() };
  }
}
