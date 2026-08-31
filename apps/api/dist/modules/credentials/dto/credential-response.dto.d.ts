export interface CredentialResponseDto {
  id: string;
  projectId: string;
  name: string;
  type: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}
