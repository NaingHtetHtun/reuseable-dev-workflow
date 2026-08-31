import { Controller, Get, Param, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { TriggersService } from './triggers.service';

@Controller('api/v1')
export class TriggersController {
  constructor(private readonly triggersService: TriggersService) {}

  @Get('trigger-types')
  getTriggerTypes() {
    return this.triggersService.getTriggerTypes();
  }

  @Post('projects/:projectId/workflows/:workflowId/trigger/activate')
  async activateTrigger(
    @Param('projectId') _projectId: string,
    @Param('workflowId') workflowId: string,
    @Body() body: { type: string; config: Record<string, unknown> },
  ) {
    const result = await this.triggersService.activateTrigger(workflowId, body.type, body.config);
    return result;
  }

  @Post('projects/:projectId/workflows/:workflowId/trigger/deactivate')
  @HttpCode(HttpStatus.OK)
  async deactivateTrigger(
    @Param('projectId') _projectId: string,
    @Param('workflowId') workflowId: string,
    @Body() body: { type: string },
  ) {
    await this.triggersService.deactivateTrigger(workflowId, body.type);
    return { success: true };
  }

  @Get('projects/:projectId/workflows/:workflowId/trigger/status')
  async getTriggerStatus(
    @Param('projectId') _projectId: string,
    @Param('workflowId') workflowId: string,
    @Param('type') type: string,
  ) {
    const status = await this.triggersService.getTriggerStatus(workflowId, type || 'manual');
    return status;
  }
}
