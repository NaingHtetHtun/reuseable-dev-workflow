import { PrismaService } from '../../shared/database/prisma.service';
export declare class HealthService {
  private readonly prisma;
  private readonly logger;
  constructor(prisma: PrismaService);
  check(): Promise<{
    status: string;
    timestamp: string;
    database: 'connected' | 'disconnected';
  }>;
  private checkDatabase;
}
