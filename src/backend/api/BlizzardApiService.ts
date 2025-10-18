import axios, { AxiosResponse } from 'axios';
import { BlizzardCharacter, BlizzardToken, BlizzardApiError } from '../../shared/types';
import { BLIZZARD_API_ENDPOINTS } from '../../shared/constants';

export class BlizzardApiService {
  private apiBaseUrl: string;
  private accessToken: string | null = null;

  constructor(apiBaseUrl: string) {
    this.apiBaseUrl = apiBaseUrl;
  }

  /**
   * Set access token for API requests
   */
  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  /**
   * Get user's character list
   */
  async getCharacterList(accessToken: string): Promise<BlizzardCharacter[]> {
    try {
      console.log('Making API call to:', `${this.apiBaseUrl}/profile/user/wow`)
      console.log('Using access token:', accessToken.substring(0, 20) + '...')
      
      const response: AxiosResponse<any> = await axios.get(
        `${this.apiBaseUrl}/profile/user/wow`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Battlenet-Namespace': 'profile-us'
          }
        }
      );

      console.log('Blizzard API response status:', response.status)
      console.log('Blizzard API response data:', JSON.stringify(response.data, null, 2))
      
      // Extract characters from the nested structure
      const characters = response.data.wow_accounts?.[0]?.characters || [];
      console.log('Extracted characters:', characters.length, 'characters')
      
      return characters;
    } catch (error: unknown) {
      console.error('Blizzard API error:', (error as any).response?.data || (error as any).message)
      throw this.handleApiError(error);
    }
  }

  /**
   * Get character profile details
   */
  async getCharacterProfile(realm: string, characterName: string, accessToken: string): Promise<BlizzardCharacter> {
    try {
      const response: AxiosResponse<BlizzardCharacter> = await axios.get(
        `${this.apiBaseUrl}${BLIZZARD_API_ENDPOINTS.CHARACTER_PROFILE}/${realm}/${characterName}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Battlenet-Namespace': 'profile-us'
          }
        }
      );

      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Get character achievements
   */
  async getCharacterAchievements(realm: string, characterName: string, accessToken: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.apiBaseUrl}${BLIZZARD_API_ENDPOINTS.CHARACTER_ACHIEVEMENTS.replace('{realm}', realm).replace('{name}', characterName)}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Battlenet-Namespace': 'profile-us'
          }
        }
      );

      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Get character Mythic+ profile
   */
  async getCharacterMythicPlus(realm: string, characterName: string, accessToken: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.apiBaseUrl}${BLIZZARD_API_ENDPOINTS.CHARACTER_MYTHIC_PLUS.replace('{realm}', realm).replace('{name}', characterName)}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Battlenet-Namespace': 'profile-us'
          }
        }
      );

      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Get character raid encounters
   */
  async getCharacterRaids(realm: string, characterName: string, accessToken: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.apiBaseUrl}${BLIZZARD_API_ENDPOINTS.CHARACTER_RAIDS.replace('{realm}', realm).replace('{name}', characterName)}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Battlenet-Namespace': 'profile-us'
          }
        }
      );

      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Get character quests
   */
  async getCharacterQuests(realm: string, characterName: string, accessToken: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.apiBaseUrl}${BLIZZARD_API_ENDPOINTS.CHARACTER_QUESTS.replace('{realm}', realm).replace('{name}', characterName)}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Battlenet-Namespace': 'profile-us'
          }
        }
      );

      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Get character PvP summary
   */
  async getCharacterPvp(realm: string, characterName: string, accessToken: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.apiBaseUrl}${BLIZZARD_API_ENDPOINTS.CHARACTER_PVP.replace('{realm}', realm).replace('{name}', characterName)}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Battlenet-Namespace': 'profile-us'
          }
        }
      );

      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Get realm information
   */
  async getRealm(realmSlug: string, accessToken: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.apiBaseUrl}${BLIZZARD_API_ENDPOINTS.REALM.replace('{realmSlug}', realmSlug)}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Battlenet-Namespace': 'dynamic-us'
          }
        }
      );

      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Handle API errors
   */
  private handleApiError(error: any): Error {
    if (error.response?.data) {
      const apiError: BlizzardApiError = error.response.data;
      return new Error(`Blizzard API Error: ${apiError.detail || apiError.type}`);
    }
    
    if (error.response?.status) {
      return new Error(`HTTP ${error.response.status}: ${error.response.statusText}`);
    }
    
    return new Error(`API request failed: ${error.message}`);
  }
}
