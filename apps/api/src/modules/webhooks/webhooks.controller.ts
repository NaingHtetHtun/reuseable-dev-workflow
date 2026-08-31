import { Controller, Post, Param, Body, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';

@Controller('api/v1/webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post(':token')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Param('token') token: string,
    @Headers() headers: Record<string, string>,
    @Body() body: unknown,
  ) {
    return this.webhooksService.handleWebhook(token, headers, body);
  }
}
