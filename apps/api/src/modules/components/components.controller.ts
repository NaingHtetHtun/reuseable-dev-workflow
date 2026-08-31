import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ComponentsService } from './components.service';
import { CreateComponentDto, UpdateComponentDto } from './dto';
import type { ComponentStatus } from '@devflow/workflow-core';

@ApiTags('components')
@Controller('api/v1/projects/:projectId/components')
export class ComponentsController {
  constructor(private readonly componentsService: ComponentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new component' })
  @ApiResponse({ status: 201, description: 'Component created' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 409, description: 'Name already exists' })
  async create(@Param('projectId') projectId: string, @Body() dto: CreateComponentDto) {
    return this.componentsService.create(projectId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List components' })
  @ApiResponse({ status: 200, description: 'List of components' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ['draft', 'published', 'deprecated'] })
  async findAll(
    @Param('projectId') projectId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('status') status?: ComponentStatus,
  ) {
    return this.componentsService.findAll(projectId, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search,
      category,
      status,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a component' })
  @ApiResponse({ status: 200, description: 'Component details' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async findOne(@Param('projectId') projectId: string, @Param('id') id: string) {
    return this.componentsService.findOne(projectId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a component' })
  @ApiResponse({ status: 200, description: 'Component updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async update(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() dto: UpdateComponentDto,
  ) {
    return this.componentsService.update(projectId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a component' })
  @ApiResponse({ status: 204, description: 'Deleted' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async remove(@Param('projectId') projectId: string, @Param('id') id: string) {
    await this.componentsService.remove(projectId, id);
  }

  @Post(':id/versions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new version' })
  @ApiResponse({ status: 201, description: 'Version created' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 409, description: 'Version already exists' })
  async createVersion(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() body: { version: string; changelog?: string },
  ) {
    return this.componentsService.createVersion(projectId, id, body.version, body.changelog);
  }

  @Get(':id/versions')
  @ApiOperation({ summary: 'List versions' })
  @ApiResponse({ status: 200, description: 'List of versions' })
  async listVersions(@Param('projectId') projectId: string, @Param('id') id: string) {
    return this.componentsService.listVersions(projectId, id);
  }

  @Get(':id/versions/:version')
  @ApiOperation({ summary: 'Get a specific version' })
  @ApiResponse({ status: 200, description: 'Version details' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async getVersion(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Param('version') version: string,
  ) {
    return this.componentsService.getVersion(projectId, id, version);
  }

  @Post(':id/clone')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Clone a component' })
  @ApiResponse({ status: 201, description: 'Component cloned' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 409, description: 'Name already exists' })
  async clone(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() body: { name: string },
  ) {
    return this.componentsService.clone(projectId, id, body.name);
  }
}
