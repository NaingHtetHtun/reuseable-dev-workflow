import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Res,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { OAuthService } from './oauth.service';
import { AuthorizeDto, CallbackQueryDto } from './dto';

@Controller('oauth')
export class OAuthController {
  constructor(private readonly oauthService: OAuthService) {}

  /**
   * List available OAuth providers.
   */
  @Get('providers')
  getProviders() {
    return this.oauthService.getProviders();
  }

  /**
   * Generate an authorization URL (returns JSON).
   * Use this when the frontend needs to handle the redirect itself.
   */
  @Post(':provider/authorize')
  async authorize(@Param('provider') provider: string, @Body() dto: AuthorizeDto) {
    const result = await this.oauthService.generateAuthorizationUrl({
      providerType: provider,
      projectId: dto.projectId,
      clientId: '', // Will be provided from credential or config
      clientSecret: '',
      scopes: dto.scopes,
      redirectUri: dto.redirectUri,
      returnUrl: dto.returnUrl,
      credentialId: dto.credentialId,
    });

    return {
      authorizationUrl: result.authorizationUrl,
      state: result.state,
      codeVerifier: result.codeVerifier,
    };
  }

  /**
   * Generate an authorization URL and redirect (GET).
   * Use this for simple browser-based flows.
   */
  @Get(':provider/authorize')
  async authorizeRedirect(
    @Param('provider') provider: string,
    @Query('projectId') projectId: string,
    @Query('clientId') clientId: string,
    @Query('clientSecret') clientSecret: string,
    @Query('scopes') scopes: string,
    @Query('redirectUri') redirectUri: string,
    @Query('returnUrl') returnUrl: string,
    @Res() res: Response,
  ) {
    if (!projectId || !clientId || !clientSecret) {
      throw new BadRequestException('projectId, clientId, and clientSecret are required');
    }

    const result = await this.oauthService.generateAuthorizationUrl({
      providerType: provider,
      projectId,
      clientId,
      clientSecret,
      scopes: scopes ? scopes.split(',') : undefined,
      redirectUri,
      returnUrl,
    });

    res.redirect(result.authorizationUrl);
  }

  /**
   * Handle OAuth callback.
   * Exchanges code for tokens and stores credential.
   */
  @Get(':provider/callback')
  async handleCallback(
    @Param('provider') provider: string,
    @Query() query: CallbackQueryDto,
    @Res() res: Response,
  ) {
    // Check for provider error
    if (query.error) {
      const errorUrl = query.error_description
        ? `${query.error}?error_description=${encodeURIComponent(query.error_description)}`
        : query.error;
      throw new BadRequestException(`OAuth error: ${errorUrl}`);
    }

    // TODO: In production, clientId and clientSecret should come from stored credential
    // For now, they need to be passed or retrieved from configuration
    const result = await this.oauthService.handleCallback({
      providerType: provider,
      code: query.code,
      state: query.state,
      clientId: '', // TODO: Retrieve from config or credential
      clientSecret: '', // TODO: Retrieve from config or credential
    });

    // Redirect to return URL or success page
    if (result.returnUrl) {
      const separator = result.returnUrl.includes('?') ? '&' : '?';
      res.redirect(
        `${result.returnUrl}${separator}credentialId=${result.credentialId}&success=true`,
      );
    } else {
      res.json({
        success: true,
        credentialId: result.credentialId,
        scopes: result.scopes,
      });
    }
  }

  /**
   * Refresh an access token.
   */
  @Post(':provider/refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Param('provider') provider: string,
    @Body()
    body: { credentialId: string; projectId: string; clientId: string; clientSecret: string },
  ) {
    return this.oauthService.refreshToken({
      providerType: provider,
      credentialId: body.credentialId,
      projectId: body.projectId,
      clientId: body.clientId,
      clientSecret: body.clientSecret,
    });
  }
}
