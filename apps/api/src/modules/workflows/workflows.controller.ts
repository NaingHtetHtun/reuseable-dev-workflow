import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import { CreateWorkflowDto, UpdateWorkflowDto, ExecuteWorkflowDto, WorkflowQueryDto } from './dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';

@Controller('projects/:projectId/workflows')
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Post()
  async create(@Param('projectId') projectId: string, @Body() dto: CreateWorkflowDto) {
    return this.workflowsService.create(projectId, dto);
  }

  @Get()
  async findAll(@Param('projectId') projectId: string, @Query() query: WorkflowQueryDto) {
    return this.workflowsService.findAll(projectId, query);
  }

  @Get(':id')
  async findOne(@Param('projectId') projectId: string, @Param('id') id: string) {
    return this.workflowsService.findOne(projectId, id);
  }

  @Patch(':id')
  async update(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() dto: UpdateWorkflowDto,
  ) {
    return this.workflowsService.update(projectId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('projectId') projectId: string, @Param('id') id: string) {
    await this.workflowsService.remove(projectId, id);
  }

  @Post(':id/execute')
  async execute(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() dto: ExecuteWorkflowDto,
  ) {
    return this.workflowsService.execute(projectId, id, dto);
  }

  @Get(':id/executions')
  async findExecutions(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.workflowsService.findExecutions(projectId, id, pagination);
  }
}
