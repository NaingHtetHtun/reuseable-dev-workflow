import { Test, TestingModule } from '@nestjs/testing';
import * as crypto from 'crypto';
import { AppModule } from './app.module';

// Set ENCRYPTION_KEY for tests
if (!process.env.ENCRYPTION_KEY) {
  process.env.ENCRYPTION_KEY = crypto.randomBytes(32).toString('hex');
}

describe('AppModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should compile the module', () => {
    expect(module).toBeDefined();
  });
});
