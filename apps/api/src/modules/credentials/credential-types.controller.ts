import { Controller, Get } from '@nestjs/common';
import { CredentialsService } from './credentials.service';

@Controller('credential-types')
export class CredentialTypesController {
  constructor(private readonly credentialsService: CredentialsService) {}

  @Get()
  findAll() {
    return this.credentialsService.getCredentialTypes();
  }
}
