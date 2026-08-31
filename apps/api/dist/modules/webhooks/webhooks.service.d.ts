import { TriggersService } from '../triggers/triggers.service';
import { WorkflowsService } from '../workflows/workflows.service';
export interface WebhookExecutionResult {
  status: 'executed' | 'skipped' | 'error';
  executionId?: string;
  reason?: string;
  error?: string;
}
export declare class WebhooksService {
  private readonly triggersService;
  private readonly workflowsService;
  private readonly logger;
  private readonly processedEvents;
  private readonly deduplicationWindowMs;
  constructor(triggersService: TriggersService, workflowsService: WorkflowsService);
  handleWebhook(
    token: string,
    headers: Record<string, string>,
    body: unknown,
  ): Promise<WebhookExecutionResult>;
  private isDuplicate;
  private markProcessed;
}
