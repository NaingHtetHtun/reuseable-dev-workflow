import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../shared/database/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { CreateCredentialDto, UpdateCredentialDto, CredentialResponseDto } from './dto';
export declare class CredentialsService {
    private readonly prisma;
    private readonly projectsService;
    private readonly configService;
    private readonly logger;
    private readonly encryption;
    private readonly registry;
    constructor(prisma: PrismaService, projectsService: ProjectsService, configService: ConfigService);
    create(projectId: string, dto: CreateCredentialDto): Promise<CredentialResponseDto>;
    findAll(projectId: string, query: {
        page?: number;
        limit?: number;
        search?: string;
        type?: string;
    }): Promise<{
        data: CredentialResponseDto[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(projectId: string, id: string): Promise<CredentialResponseDto>;
    update(projectId: string, id: string, dto: UpdateCredentialDto): Promise<CredentialResponseDto>;
    remove(projectId: string, id: string): Promise<void>;
    resolveCredential(projectId: string, credentialId: string): Promise<Record<string, unknown>>;
    getCredentialTypes(): {
        type: string;
        displayName: string;
        description: string;
        category: string;
        secretFields: {
            name: string;
            displayName: string;
            type: "string" | "number" | "boolean";
            required: boolean;
            description: string | undefined;
        }[];
        metadataFields: {
            name: string;
            displayName: string;
            type: "string" | "number" | "boolean";
            required: boolean;
            description: string | undefined;
        }[];
    }[];
    private toResponseDto;
}
