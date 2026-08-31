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
import { ResourcesService } from './resources.service';
import { CreateResourceDto, UpdateResourceDto } from './dto';
import type { ResourceStatus } from '@devflow/workflow-core';

@ApiTags('resources')
@Controller('api/v1/projects/:projectId/resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new resource definition' })
  @ApiResponse({ status: 201, description: 'Resource created' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 409, description: 'Name already exists' })
  async create(@Param('projectId') projectId: string, @Body() dto: CreateResourceDto) {
    return this.resourcesService.create(projectId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List resource definitions' })
  @ApiResponse({ status: 200, description: 'List of resources' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ['draft', 'published', 'deprecated'] })
  async findAll(
    @Param('projectId') projectId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: ResourceStatus,
  ) {
    return this.resourcesService.findAll(projectId, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search,
      status,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a resource definition' })
  @ApiResponse({ status: 200, description: 'Resource details' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async findOne(@Param('projectId') projectId: string, @Param('id') id: string) {
    return this.resourcesService.findOne(projectId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a resource definition' })
  @ApiResponse({ status: 200, description: 'Resource updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async update(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() dto: UpdateResourceDto,
  ) {
    return this.resourcesService.update(projectId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a resource definition' })
  @ApiResponse({ status: 204, description: 'Deleted' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async remove(@Param('projectId') projectId: string, @Param('id') id: string) {
    await this.resourcesService.remove(projectId, id);
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
    return this.resourcesService.createVersion(projectId, id, body.version, body.changelog);
  }

  @Get(':id/versions')
  @ApiOperation({ summary: 'List versions' })
  @ApiResponse({ status: 200, description: 'List of versions' })
  async listVersions(@Param('projectId') projectId: string, @Param('id') id: string) {
    return this.resourcesService.listVersions(projectId, id);
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
    return this.resourcesService.getVersion(projectId, id, version);
  }

  @Post(':id/generate/prisma')
  @ApiOperation({ summary: 'Preview generated Prisma model' })
  @ApiResponse({ status: 200, description: 'Generated Prisma model' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async generatePrisma(@Param('projectId') projectId: string, @Param('id') id: string) {
    return this.resourcesService.generatePrisma(projectId, id);
  }

  @Post(':id/generate/validation')
  @ApiOperation({ summary: 'Preview generated validation DTO' })
  @ApiResponse({ status: 200, description: 'Generated validation DTO' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async generateValidation(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() body: { operation: 'create' | 'update' | 'response' },
  ) {
    return this.resourcesService.generateValidation(projectId, id, body.operation);
  }
}
