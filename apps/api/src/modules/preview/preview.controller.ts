import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PreviewService } from './preview.service';
import { WorkflowPreviewDto, NodePreviewDto } from './dto';
import type { WorkflowDefinition } from '@devflow/workflow-core';

@ApiTags('preview')
@Controller('api/v1/preview')
export class PreviewController {
  constructor(private readonly previewService: PreviewService) {}

  @Post('workflow')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Preview a workflow definition' })
  @ApiResponse({
    status: 200,
    description: 'Workflow preview result',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        mode: { type: 'string', enum: ['validate', 'dry-run', 'execute', 'step'] },
        validationErrors: { type: 'array', items: { type: 'string' } },
        nodeResults: { type: 'array' },
        output: {},
        durationMs: { type: 'number' },
        warnings: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async previewWorkflow(@Body() dto: WorkflowPreviewDto) {
    const definition = dto.definition as unknown as WorkflowDefinition;
    return this.previewService.previewWorkflow(definition, dto.mode, dto.input, dto.options);
  }

  @Post('workflow/validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate a workflow definition' })
  @ApiResponse({
    status: 200,
    description: 'Validation result',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        mode: { type: 'string', enum: ['validate'] },
        validationErrors: { type: 'array', items: { type: 'string' } },
        nodeResults: { type: 'array' },
        output: {},
        durationMs: { type: 'number' },
        warnings: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async validateWorkflow(@Body() dto: WorkflowPreviewDto) {
    const definition = dto.definition as unknown as WorkflowDefinition;
    return this.previewService.validateWorkflow(definition);
  }

  @Post('node')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Preview a single node' })
  @ApiResponse({
    status: 200,
    description: 'Node preview result',
    schema: {
      type: 'object',
      properties: {
        nodeId: { type: 'string' },
        nodeType: { type: 'string' },
        nodeName: { type: 'string' },
        input: {},
        output: {},
        success: { type: 'boolean' },
        error: { type: 'string' },
        durationMs: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async previewNode(@Body() dto: NodePreviewDto) {
    const definition = dto.definition as unknown as WorkflowDefinition;
    return this.previewService.previewNode(definition, dto.nodeId, dto.input, dto.options);
  }
}
