import axios, { AxiosResponse } from 'axios';
import { BlizzardToken, BlizzardApiError } from '../../shared/types';
import { BLIZZARD_API_ENDPOINTS, TOKEN_EXPIRY_BUFFER } from '../../shared/constants';

export class BlizzardAuthService {
  private clientId: string;
  private clientSecret: string;
  private oauthUrl: string;
  private apiBaseUrl: string;

  constructor(clientId: string, clientSecret: string, oauthUrl: string, apiBaseUrl: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.oauthUrl = oauthUrl;
    this.apiBaseUrl = apiBaseUrl;
  }

  /**
   * Get OAuth authorization URL for user login
   */
  getAuthorizationUrl(redirectUri: string, state?: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'wow.profile',
      state: state || this.generateState()
    });

    return `${this.oauthUrl}${BLIZZARD_API_ENDPOINTS.OAUTH_AUTHORIZE}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string, redirectUri: string): Promise<BlizzardToken> {
    try {
      const response: AxiosResponse<BlizzardToken> = await axios.post(
        `${this.oauthUrl}${BLIZZARD_API_ENDPOINTS.OAUTH_TOKEN}`,
        new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code,
          redirect_uri: redirectUri
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const token = response.data;
      token.expires_at = Date.now() + (token.expires_in * 1000);
      
      return token;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<BlizzardToken> {
    try {
      const response: AxiosResponse<BlizzardToken> = await axios.post(
        `${this.oauthUrl}${BLIZZARD_API_ENDPOINTS.OAUTH_TOKEN}`,
        new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: refreshToken
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const token = response.data;
      token.expires_at = Date.now() + (token.expires_in * 1000);
      
      return token;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Get client credentials token for public API access
   */
  async getClientCredentialsToken(): Promise<BlizzardToken> {
    try {
      const response: AxiosResponse<BlizzardToken> = await axios.post(
        `${this.oauthUrl}${BLIZZARD_API_ENDPOINTS.OAUTH_TOKEN}`,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const token = response.data;
      token.expires_at = Date.now() + (token.expires_in * 1000);
      
      return token;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Check if token is expired or will expire soon
   */
  isTokenExpired(token: BlizzardToken): boolean {
    const now = Date.now();
    return token.expires_at <= (now + TOKEN_EXPIRY_BUFFER * 1000);
  }

  /**
   * Check if token needs refresh (expires within buffer time)
   */
  needsRefresh(token: BlizzardToken): boolean {
    return this.isTokenExpired(token);
  }

  /**
   * Generate random state parameter for OAuth
   */
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Handle authentication errors
   */
  private handleAuthError(error: any): Error {
    if (error.response?.data) {
      const apiError: BlizzardApiError = error.response.data;
      return new Error(`Blizzard API Error: ${apiError.detail || apiError.type}`);
    }
    
    if (error.response?.status) {
      return new Error(`HTTP ${error.response.status}: ${error.response.statusText}`);
    }
    
    return new Error(`Authentication failed: ${error.message}`);
  }
}
