"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const config_1 = require("@nestjs/config");
const credentials_service_1 = require("./credentials.service");
const prisma_service_1 = require("../../shared/database/prisma.service");
const projects_service_1 = require("../projects/projects.service");
const crypto = __importStar(require("crypto"));
const TEST_ENCRYPTION_KEY = crypto.randomBytes(32).toString('hex');
describe('CredentialsService', () => {
    let service;
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
            get: jest.fn((key) => {
                if (key === 'ENCRYPTION_KEY')
                    return TEST_ENCRYPTION_KEY;
                return undefined;
            }),
        };
        const module = await testing_1.Test.createTestingModule({
            providers: [
                credentials_service_1.CredentialsService,
                { provide: prisma_service_1.PrismaService, useValue: mockPrisma },
                { provide: projects_service_1.ProjectsService, useValue: mockProjectsService },
                { provide: config_1.ConfigService, useValue: configService },
            ],
        }).compile();
        service = module.get(credentials_service_1.CredentialsService);
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
            const createCall = mockPrisma.credential.create.mock.calls[0][0];
            expect(createCall.data.data).not.toBe('secret-key-123');
            expect(createCall.data.data).not.toContain('secret-key-123');
        });
        it('should reject unknown credential type', async () => {
            mockProjectsService.findOne.mockResolvedValue({ id: 'proj-1', name: 'Test' });
            await expect(service.create('proj-1', {
                name: 'Test',
                type: 'unknown-type',
                data: { anything: 'value' },
            })).rejects.toThrow('Unknown credential type');
        });
        it('should reject invalid credential data', async () => {
            mockProjectsService.findOne.mockResolvedValue({ id: 'proj-1', name: 'Test' });
            await expect(service.create('proj-1', {
                name: 'Test',
                type: 'api-key',
                data: {},
            })).rejects.toThrow('Invalid credential data');
        });
    });
    describe('resolveCredential', () => {
        it('should decrypt and return credential data', async () => {
            const originalData = { apiKey: 'super-secret-key' };
            const encryption = service.encryption;
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
            await expect(service.resolveCredential('proj-1', 'nonexistent')).rejects.toThrow('Credential not found');
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
            expect(types.some((t) => t.type === 'api-key')).toBe(true);
            expect(types.some((t) => t.type === 'google-oauth2')).toBe(true);
        });
    });
});
//# sourceMappingURL=credentials.service.spec.js.map