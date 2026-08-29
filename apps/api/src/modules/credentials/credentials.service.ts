import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../shared/database/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { CreateCredentialDto, UpdateCredentialDto, CredentialResponseDto } from './dto';
import {
  EncryptionService,
  builtInCredentialTypes,
  IntegrationRegistry,
  CredentialTypeDefinition,
  CredentialField,
} from '@devflow/workflow-core';

@Injectable()
export class CredentialsService {
  private readonly logger = new Logger(CredentialsService.name);
  private readonly encryption: EncryptionService;
  private readonly registry: IntegrationRegistry;

  constructor(
    private readonly prisma: PrismaService,
    private readonly projectsService: ProjectsService,
    private readonly configService: ConfigService,
  ) {
    const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY');
    if (!encryptionKey) {
      throw new Error('ENCRYPTION_KEY environment variable is required');
    }
    this.encryption = new EncryptionService(encryptionKey);

    // Initialize integration registry with built-in types
    this.registry = new IntegrationRegistry();
    for (const type of builtInCredentialTypes) {
      this.registry.register(type);
    }
  }

  /**
   * Create a new credential with encrypted secret data.
   */
  async create(projectId: string, dto: CreateCredentialDto): Promise<CredentialResponseDto> {
    // Verify project exists
    await this.projectsService.findOne(projectId);

    // Validate credential type
    if (!this.registry.hasType(dto.type)) {
      throw new BadRequestException(`Unknown credential type: ${dto.type}`);
    }

    // Validate credential data against type definition
    const validation = this.registry.validateCredential(dto.type, dto.data);
    if (!validation.valid) {
      throw new BadRequestException(`Invalid credential data: ${validation.errors.join('; ')}`);
    }

    // Encrypt secret data
    const encryptedData = this.encryption.encryptObject(dto.data);

    const credential = await this.prisma.credential.create({
      data: {
        projectId,
        name: dto.name,
        type: dto.type,
        data: encryptedData,
        metadata: (dto.metadata as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      },
    });

    this.logger.log(`Created credential: ${credential.id} (${dto.type})`);
    return this.toResponseDto(credential);
  }

  /**
   * List credentials for a project (secrets stripped).
   */
  async findAll(
    projectId: string,
    query: { page?: number; limit?: number; search?: string; type?: string },
  ): Promise<{
    data: CredentialResponseDto[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const { page = 1, limit = 20, search, type } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CredentialWhereInput = {
      projectId,
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
      ...(type && { type }),
    };

    const [data, total] = await Promise.all([
      this.prisma.credential.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.credential.count({ where }),
    ]);

    return {
      data: data.map((c) => this.toResponseDto(c)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single credential by ID (secrets stripped).
   */
  async findOne(projectId: string, id: string): Promise<CredentialResponseDto> {
    const credential = await this.prisma.credential.findFirst({
      where: { id, projectId },
    });

    if (!credential) {
      throw new NotFoundException('Credential not found');
    }

    return this.toResponseDto(credential);
  }

  /**
   * Update a credential. Re-encrypts secret data if provided.
   */
  async update(
    projectId: string,
    id: string,
    dto: UpdateCredentialDto,
  ): Promise<CredentialResponseDto> {
    await this.findOne(projectId, id);

    // If data is being updated, validate and re-encrypt
    let encryptedData: string | undefined;
    if (dto.data) {
      const credential = await this.prisma.credential.findFirst({
        where: { id, projectId },
      });

      if (!credential) {
        throw new NotFoundException('Credential not found');
      }

      // Validate against the existing type
      const validation = this.registry.validateCredential(credential.type, dto.data);
      if (!validation.valid) {
        throw new BadRequestException(`Invalid credential data: ${validation.errors.join('; ')}`);
      }

      encryptedData = this.encryption.encryptObject(dto.data);
    }

    const updated = await this.prisma.credential.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(encryptedData !== undefined && { data: encryptedData }),
        ...(dto.metadata !== undefined && {
          metadata: (dto.metadata as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        }),
      },
    });

    this.logger.log(`Updated credential: ${id}`);
    return this.toResponseDto(updated);
  }

  /**
   * Delete a credential.
   */
  async remove(projectId: string, id: string): Promise<void> {
    await this.findOne(projectId, id);

    await this.prisma.credential.delete({ where: { id } });
    this.logger.log(`Deleted credential: ${id}`);
  }

  /**
   * Resolve a credential by ID — decrypts and returns secret data.
   * Used by the workflow executor to pass credentials to nodes.
   */
  async resolveCredential(
    projectId: string,
    credentialId: string,
  ): Promise<Record<string, unknown>> {
    const credential = await this.prisma.credential.findFirst({
      where: { id: credentialId, projectId },
    });

    if (!credential) {
      throw new NotFoundException(`Credential not found: ${credentialId}`);
    }

    // Decrypt the secret data
    return this.encryption.decryptObject(credential.data);
  }

  /**
   * Get available credential types.
   */
  getCredentialTypes() {
    return this.registry.getAll().map((def: CredentialTypeDefinition) => ({
      type: def.type,
      displayName: def.displayName,
      description: def.description,
      category: def.category,
      secretFields: def.secretFields.map((f: CredentialField) => ({
        name: f.name,
        displayName: f.displayName,
        type: f.type,
        required: f.required,
        description: f.description,
      })),
      metadataFields: def.metadataFields.map((f: CredentialField) => ({
        name: f.name,
        displayName: f.displayName,
        type: f.type,
        required: f.required,
        description: f.description,
      })),
    }));
  }

  /**
   * Convert Prisma credential to response DTO (secrets stripped).
   */
  private toResponseDto(credential: {
    id: string;
    projectId: string;
    name: string;
    type: string;
    metadata: unknown;
    createdAt: Date;
    updatedAt: Date;
  }): CredentialResponseDto {
    return {
      id: credential.id,
      projectId: credential.projectId,
      name: credential.name,
      type: credential.type,
      metadata: credential.metadata as Record<string, unknown> | null,
      createdAt: credential.createdAt,
      updatedAt: credential.updatedAt,
    };
  }
}
