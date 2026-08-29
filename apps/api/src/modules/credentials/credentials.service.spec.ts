import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CredentialsService } from './credentials.service';
import { PrismaService } from '../../shared/database/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import * as crypto from 'crypto';

// Generate a test encryption key
const TEST_ENCRYPTION_KEY = crypto.randomBytes(32).toString('hex');

describe('CredentialsService', () => {
  let service: CredentialsService;

  const mockPrisma = {
    credential: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockProjectsService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const configService = {
      get: jest.fn((key: string) => {
        if (key === 'ENCRYPTION_KEY') return TEST_ENCRYPTION_KEY;
        return undefined;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CredentialsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ProjectsService, useValue: mockProjectsService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<CredentialsService>(CredentialsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a credential with encrypted data', async () => {
      mockProjectsService.findOne.mockResolvedValue({ id: 'proj-1', name: 'Test' });
      mockPrisma.credential.create.mockResolvedValue({
        id: 'cred-1',
        projectId: 'proj-1',
        name: 'My API Key',
        type: 'api-key',
        data: 'encrypted-data',
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.create('proj-1', {
        name: 'My API Key',
        type: 'api-key',
        data: { apiKey: 'secret-key-123' },
      });

      expect(result.name).toBe('My API Key');
      expect(result.type).toBe('api-key');
      expect(result.id).toBe('cred-1');
      // Verify that data was encrypted (not stored as plain text)
      const createCall = mockPrisma.credential.create.mock.calls[0][0];
      expect(createCall.data.data).not.toBe('secret-key-123');
      expect(createCall.data.data).not.toContain('secret-key-123');
    });

    it('should reject unknown credential type', async () => {
      mockProjectsService.findOne.mockResolvedValue({ id: 'proj-1', name: 'Test' });

      await expect(
        service.create('proj-1', {
          name: 'Test',
          type: 'unknown-type',
          data: { anything: 'value' },
        }),
      ).rejects.toThrow('Unknown credential type');
    });

    it('should reject invalid credential data', async () => {
      mockProjectsService.findOne.mockResolvedValue({ id: 'proj-1', name: 'Test' });

      await expect(
        service.create('proj-1', {
          name: 'Test',
          type: 'api-key',
          data: {}, // Missing required 'apiKey' field
        }),
      ).rejects.toThrow('Invalid credential data');
    });
  });

  describe('resolveCredential', () => {
    it('should decrypt and return credential data', async () => {
      const originalData = { apiKey: 'super-secret-key' };

      // Encrypt the data as the service would
      const encryption = (
        service as unknown as {
          encryption: { encryptObject: (d: Record<string, unknown>) => string };
        }
      ).encryption;
      const encryptedData = encryption.encryptObject(originalData);

      mockPrisma.credential.findFirst.mockResolvedValue({
        id: 'cred-1',
        projectId: 'proj-1',
        name: 'Test',
        type: 'api-key',
        data: encryptedData,
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.resolveCredential('proj-1', 'cred-1');
      expect(result).toEqual(originalData);
    });

    it('should throw NotFoundException for missing credential', async () => {
      mockPrisma.credential.findFirst.mockResolvedValue(null);

      await expect(service.resolveCredential('proj-1', 'nonexistent')).rejects.toThrow(
        'Credential not found',
      );
    });
  });

  describe('findOne', () => {
    it('should return credential without secrets', async () => {
      mockPrisma.credential.findFirst.mockResolvedValue({
        id: 'cred-1',
        projectId: 'proj-1',
        name: 'Test',
        type: 'api-key',
        data: 'encrypted-data',
        metadata: { headerName: 'X-API-Key' },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.findOne('proj-1', 'cred-1');
      expect(result).not.toHaveProperty('data');
      expect(result.name).toBe('Test');
      expect(result.metadata).toEqual({ headerName: 'X-API-Key' });
    });
  });

  describe('getCredentialTypes', () => {
    it('should return available credential types', () => {
      const types = service.getCredentialTypes();
      expect(types.length).toBeGreaterThan(0);
      expect(types.some((t: { type: string }) => t.type === 'api-key')).toBe(true);
      expect(types.some((t: { type: string }) => t.type === 'google-oauth2')).toBe(true);
    });
  });
});
