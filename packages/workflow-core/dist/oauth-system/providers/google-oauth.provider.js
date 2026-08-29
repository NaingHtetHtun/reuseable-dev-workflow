import * as crypto from 'crypto';
import { OAuthError, } from '../oauth-provider.interface';
import { PkceHelper } from '../pkce-helper';
/**
 * Google OAuth 2.0 provider implementation.
 *
 * Supports:
 * - Authorization Code flow
 * - PKCE (S256)
 * - Refresh tokens
 *
 * Google endpoints:
 * - Authorization: https://accounts.google.com/o/oauth2/v2/auth
 * - Token: https://oauth2.googleapis.com/token
 * - Revocation: https://oauth2.googleapis.com/revoke
 * - UserInfo: https://www.googleapis.com/oauth2/v3/userinfo
 */
export class GoogleOAuthProvider {
    metadata = {
        type: 'google-oauth2',
        displayName: 'Google OAuth2',
        description: 'Google OAuth2 authentication and API access',
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenEndpoint: 'https://oauth2.googleapis.com/token',
        revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
        userinfoEndpoint: 'https://www.googleapis.com/oauth2/v3/userinfo',
        supportedFlows: ['authorization-code'],
        supportsPkce: true,
        defaultScopes: ['email', 'profile'],
    };
    buildAuthorizationUrl(params) {
        // Generate PKCE challenge if not provided
        let codeChallenge;
        let codeVerifier;
        let method;
        if (params.codeChallenge) {
            codeChallenge = params.codeChallenge;
            method = params.codeChallengeMethod ?? 'S256';
        }
        else {
            const pkce = PkceHelper.generate();
            codeChallenge = pkce.codeChallenge;
            codeVerifier = pkce.codeVerifier;
            method = pkce.method;
        }
        const url = new URL(this.metadata.authorizationEndpoint);
        url.searchParams.set('response_type', 'code');
        url.searchParams.set('client_id', params.clientId);
        url.searchParams.set('redirect_uri', params.redirectUri);
        url.searchParams.set('scope', params.scope.join(' '));
        url.searchParams.set('state', params.state);
        url.searchParams.set('code_challenge', codeChallenge);
        url.searchParams.set('code_challenge_method', method);
        // access_type=offline for refresh token (only on first consent)
        url.searchParams.set('access_type', 'offline');
        // Add extra params
        if (params.extraParams) {
            for (const [key, value] of Object.entries(params.extraParams)) {
                url.searchParams.set(key, value);
            }
        }
        return {
            url: url.toString(),
            state: params.state,
            codeVerifier,
        };
    }
    validateState(state, expectedState) {
        if (state.length !== expectedState.length) {
            return false;
        }
        return crypto.timingSafeEqual(Buffer.from(state), Buffer.from(expectedState));
    }
    async exchangeCode(params) {
        const body = new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: params.clientId,
            client_secret: params.clientSecret,
            code: params.code,
            redirect_uri: params.redirectUri,
        });
        if (params.codeVerifier) {
            body.set('code_verifier', params.codeVerifier);
        }
        const response = await fetch(this.metadata.tokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body.toString(),
        });
        const data = (await response.json());
        if (!response.ok) {
            throw new OAuthError(data.error, data.error_description);
        }
        return {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresIn: data.expires_in,
            tokenType: data.token_type,
            scope: data.scope,
        };
    }
    async refreshToken(params) {
        const body = new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: params.clientId,
            client_secret: params.clientSecret,
            refresh_token: params.refreshToken,
        });
        const response = await fetch(this.metadata.tokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body.toString(),
        });
        const data = (await response.json());
        if (!response.ok) {
            throw new OAuthError(data.error, data.error_description);
        }
        return {
            accessToken: data.access_token,
            // Google may not return a new refresh token
            refreshToken: data.refresh_token ?? params.refreshToken,
            expiresIn: data.expires_in,
            tokenType: data.token_type,
            scope: data.scope,
        };
    }
    validateTokenResponse(response) {
        return (typeof response === 'object' &&
            response !== null &&
            'accessToken' in response &&
            typeof response.accessToken === 'string');
    }
}
//# sourceMappingURL=google-oauth.provider.js.map