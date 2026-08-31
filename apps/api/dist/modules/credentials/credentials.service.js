'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return (c > 3 && r && Object.defineProperty(target, key, r), r);
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
var CredentialsService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.CredentialsService = void 0;
const common_1 = require('@nestjs/common');
const config_1 = require('@nestjs/config');
const client_1 = require('@prisma/client');
const prisma_service_1 = require('../../shared/database/prisma.service');
const projects_service_1 = require('../projects/projects.service');
const workflow_core_1 = require('@devflow/workflow-core');
let CredentialsService = (CredentialsService_1 = class CredentialsService {
  prisma;
  projectsService;
  configService;
  logger = new common_1.Logger(CredentialsService_1.name);
  encryption;
  registry;
  constructor(prisma, projectsService, configService) {
    this.prisma = prisma;
    this.projectsService = projectsService;
    this.configService = configService;
    const encryptionKey = this.configService.get('ENCRYPTION_KEY');
    if (!encryptionKey) {
      throw new Error('ENCRYPTION_KEY environment variable is required');
    }
    this.encryption = new workflow_core_1.EncryptionService(encryptionKey);
    this.registry = new workflow_core_1.IntegrationRegistry();
    for (const type of workflow_core_1.builtInCredentialTypes) {
      this.registry.register(type);
    }
  }
  async create(projectId, dto) {
    await this.projectsService.findOne(projectId);
    if (!this.registry.hasType(dto.type)) {
      throw new common_1.BadRequestException(`Unknown credential type: ${dto.type}`);
    }
    const validation = this.registry.validateCredential(dto.type, dto.data);
    if (!validation.valid) {
      throw new common_1.BadRequestException(
        `Invalid credential data: ${validation.errors.join('; ')}`,
      );
    }
    const encryptedData = this.encryption.encryptObject(dto.data);
    const credential = await this.prisma.credential.create({
      data: {
        projectId,
        name: dto.name,
        type: dto.type,
        data: encryptedData,
        metadata: dto.metadata ?? client_1.Prisma.JsonNull,
      },
    });
    this.logger.log(`Created credential: ${credential.id} (${dto.type})`);
    return this.toResponseDto(credential);
  }
  async findAll(projectId, query) {
    const { page = 1, limit = 20, search, type } = query;
    const skip = (page - 1) * limit;
    const where = {
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
  async findOne(projectId, id) {
    const credential = await this.prisma.credential.findFirst({
      where: { id, projectId },
    });
    if (!credential) {
      throw new common_1.NotFoundException('Credential not found');
    }
    return this.toResponseDto(credential);
  }
  async update(projectId, id, dto) {
    await this.findOne(projectId, id);
    let encryptedData;
    if (dto.data) {
      const credential = await this.prisma.credential.findFirst({
        where: { id, projectId },
      });
      if (!credential) {
        throw new common_1.NotFoundException('Credential not found');
      }
      const validation = this.registry.validateCredential(credential.type, dto.data);
      if (!validation.valid) {
        throw new common_1.BadRequestException(
          `Invalid credential data: ${validation.errors.join('; ')}`,
        );
      }
      encryptedData = this.encryption.encryptObject(dto.data);
    }
    const updated = await this.prisma.credential.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(encryptedData !== undefined && { data: encryptedData }),
        ...(dto.metadata !== undefined && {
          metadata: dto.metadata ?? client_1.Prisma.JsonNull,
        }),
      },
    });
    this.logger.log(`Updated credential: ${id}`);
    return this.toResponseDto(updated);
  }
  async remove(projectId, id) {
    await this.findOne(projectId, id);
    await this.prisma.credential.delete({ where: { id } });
    this.logger.log(`Deleted credential: ${id}`);
  }
  async resolveCredential(projectId, credentialId) {
    const credential = await this.prisma.credential.findFirst({
      where: { id: credentialId, projectId },
    });
    if (!credential) {
      throw new common_1.NotFoundException(`Credential not found: ${credentialId}`);
    }
    return this.encryption.decryptObject(credential.data);
  }
  getCredentialTypes() {
    return this.registry.getAll().map((def) => ({
      type: def.type,
      displayName: def.displayName,
      description: def.description,
      category: def.category,
      secretFields: def.secretFields.map((f) => ({
        name: f.name,
        displayName: f.displayName,
        type: f.type,
        required: f.required,
        description: f.description,
      })),
      metadataFields: def.metadataFields.map((f) => ({
        name: f.name,
        displayName: f.displayName,
        type: f.type,
        required: f.required,
        description: f.description,
      })),
    }));
  }
  toResponseDto(credential) {
    return {
      id: credential.id,
      projectId: credential.projectId,
      name: credential.name,
      type: credential.type,
      metadata: credential.metadata,
      createdAt: credential.createdAt,
      updatedAt: credential.updatedAt,
    };
  }
});
exports.CredentialsService = CredentialsService;
exports.CredentialsService =
  CredentialsService =
  CredentialsService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __metadata('design:paramtypes', [
          prisma_service_1.PrismaService,
          projects_service_1.ProjectsService,
          config_1.ConfigService,
        ]),
      ],
      CredentialsService,
    );
//# sourceMappingURL=credentials.service.js.map
