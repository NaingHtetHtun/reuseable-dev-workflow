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
import { CredentialsService } from './credentials.service';
import { CreateCredentialDto, UpdateCredentialDto, CredentialResponseDto } from './dto';

@Controller('projects/:projectId/credentials')
export class CredentialsController {
  constructor(private readonly credentialsService: CredentialsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateCredentialDto,
  ): Promise<CredentialResponseDto> {
    return this.credentialsService.create(projectId, dto);
  }

  @Get()
  async findAll(
    @Param('projectId') projectId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('type') type?: string,
  ) {
    return this.credentialsService.findAll(projectId, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search,
      type,
    });
  }

  @Get(':id')
  async findOne(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
  ): Promise<CredentialResponseDto> {
    return this.credentialsService.findOne(projectId, id);
  }

  @Patch(':id')
  async update(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCredentialDto,
  ): Promise<CredentialResponseDto> {
    return this.credentialsService.update(projectId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('projectId') projectId: string, @Param('id') id: string): Promise<void> {
    return this.credentialsService.remove(projectId, id);
  }
}
