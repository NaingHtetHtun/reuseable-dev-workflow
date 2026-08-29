/**
 * Credential response DTO.
 * Secrets are NEVER included in API responses.
 */
export interface CredentialResponseDto {
  id: string;
  projectId: string;
  name: string;
  type: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}
