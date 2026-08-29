import { Module } from '@nestjs/common';
import { CredentialsService } from './credentials.service';
import { CredentialsController } from './credentials.controller';
import { CredentialTypesController } from './credential-types.controller';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [ProjectsModule],
  controllers: [CredentialsController, CredentialTypesController],
  providers: [CredentialsService],
  exports: [CredentialsService],
})
export class CredentialsModule {}
