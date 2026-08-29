import { CredentialsService } from './credentials.service';
import { CreateCredentialDto, UpdateCredentialDto, CredentialResponseDto } from './dto';
export declare class CredentialsController {
    private readonly credentialsService;
    constructor(credentialsService: CredentialsService);
    create(projectId: string, dto: CreateCredentialDto): Promise<CredentialResponseDto>;
    findAll(projectId: string, page?: string, limit?: string, search?: string, type?: string): Promise<{
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
}
