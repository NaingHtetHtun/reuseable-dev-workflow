import { CredentialsService } from './credentials.service';
export declare class CredentialTypesController {
  private readonly credentialsService;
  constructor(credentialsService: CredentialsService);
  findAll(): {
    type: string;
    displayName: string;
    description: string;
    category: string;
    secretFields: {
      name: string;
      displayName: string;
      type: 'string' | 'number' | 'boolean';
      required: boolean;
      description: string | undefined;
    }[];
    metadataFields: {
      name: string;
      displayName: string;
      type: 'string' | 'number' | 'boolean';
      required: boolean;
      description: string | undefined;
    }[];
  }[];
}
