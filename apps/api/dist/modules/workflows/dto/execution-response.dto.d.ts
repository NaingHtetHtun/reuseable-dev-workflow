export declare class ExecutionResponseDto {
    id: string;
    workflowId: string;
    status: string;
    input: unknown;
    output: unknown;
    error: string | null;
    nodeResults: unknown;
    startedAt: Date;
    completedAt: Date | null;
}
