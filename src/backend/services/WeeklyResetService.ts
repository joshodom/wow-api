import { DatabaseService } from '../database/DatabaseService';
import { ActivityTrackingService } from './ActivityTrackingService';
import { BlizzardApiService } from '../api/BlizzardApiService';

export class WeeklyResetService {
  private static instance: WeeklyResetService;
  private dbService: DatabaseService;
  private apiService: BlizzardApiService;

  private constructor(dbService: DatabaseService, apiService: BlizzardApiService) {
    this.dbService = dbService;
    this.apiService = apiService;
  }

  public static getInstance(dbService?: DatabaseService, apiService?: BlizzardApiService): WeeklyResetService {
    if (!WeeklyResetService.instance) {
      if (!dbService || !apiService) {
        throw new Error('DatabaseService and BlizzardApiService are required for WeeklyResetService initialization');
      }
      WeeklyResetService.instance = new WeeklyResetService(dbService, apiService);
    }
    return WeeklyResetService.instance;
  }

  /**
   * Check if it's time for a weekly reset (Tuesday 10 AM UTC)
   */
  public static isWeeklyResetTime(): boolean {
    const now = new Date();
    const utcNow = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
    
    // WoW weekly reset is Tuesday at 10 AM UTC
    const dayOfWeek = utcNow.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday
    const hour = utcNow.getHours();
    const minute = utcNow.getMinutes();
    
    // Check if it's Tuesday (day 2) and past 10 AM UTC
    if (dayOfWeek === 2 && hour >= 10) {
      return true;
    }
    
    // Check if it's Wednesday through Monday (days 3-1) - reset has already happened
    if (dayOfWeek >= 3 || dayOfWeek <= 1) {
      return true;
    }
    
    return false;
  }

  /**
   * Get the timestamp of the last weekly reset
   */
  public static getLastResetTimestamp(): number {
    const now = new Date();
    const utcNow = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
    
    // Find the most recent Tuesday 10 AM UTC
    const dayOfWeek = utcNow.getDay();
    const daysSinceTuesday = dayOfWeek >= 2 ? dayOfWeek - 2 : dayOfWeek + 5;
    
    const lastReset = new Date(utcNow);
    lastReset.setDate(lastReset.getDate() - daysSinceTuesday);
    lastReset.setHours(10, 0, 0, 0);
    
    return lastReset.getTime();
  }

  /**
   * Get the timestamp of the next weekly reset
   */
  public static getNextResetTimestamp(): number {
    const now = new Date();
    const utcNow = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
    
    // Find the next Tuesday 10 AM UTC
    const dayOfWeek = utcNow.getDay();
    const daysUntilTuesday = dayOfWeek <= 2 ? 2 - dayOfWeek : 9 - dayOfWeek;
    
    const nextReset = new Date(utcNow);
    nextReset.setDate(nextReset.getDate() + daysUntilTuesday);
    nextReset.setHours(10, 0, 0, 0);
    
    return nextReset.getTime();
  }

  /**
   * Check if activities need to be reset based on the last reset time
   */
  public static shouldResetActivities(lastResetCheck: number): boolean {
    const lastReset = this.getLastResetTimestamp();
    return lastReset > lastResetCheck;
  }

  /**
   * Perform weekly reset for all users
   */
  public async performWeeklyReset(): Promise<void> {
    console.log('🔄 Starting weekly reset process...');
    
    try {
      // Get all users from the database
      const users = await this.dbService.getAllUsers();
      console.log(`📊 Found ${users.length} users to process for weekly reset`);
      
      let resetCount = 0;
      
      for (const user of users) {
        try {
          // Check if user has valid access token
          if (!user.accessToken || !user.accessToken.access_token) {
            console.log(`⚠️ Skipping user ${user.id} - no valid tokens`);
            continue;
          }
          
          // Use the access token directly (we'll implement token refresh later)
          const accessToken = user.accessToken.access_token;
          
          // Get fresh character data
          const characters = await this.apiService.getCharacterList(accessToken);
          if (!characters || characters.length === 0) {
            console.log(`⚠️ No characters found for user ${user.id}`);
            continue;
          }
          
          // Process each character
          for (const character of characters) {
            try {
              // Get fresh activity data
              const activityData = await this.apiService.getCharacterActivityData(
                character.realm.slug,
                character.name,
                accessToken
              );
              
              // Analyze activities with fresh data
              const activities = ActivityTrackingService.analyzeWeeklyActivities(
                character.id,
                activityData
              );
              
              // Update character progress in database
              await this.dbService.updateCharacterProgress(character.id, {
                characterId: character.id,
                characterName: character.name,
                realm: character.realm.slug,
                race: character.playable_race?.name?.en_US || 'Unknown',
                className: character.playable_class?.name?.en_US || 'Unknown',
                level: character.level,
                faction: character.faction?.type || 'Unknown',
                activities: activities,
                lastUpdated: new Date()
              });
              
              console.log(`✅ Reset activities for ${character.name}@${character.realm.slug}`);
              resetCount++;
              
            } catch (error) {
              console.error(`❌ Failed to reset activities for ${character.name}@${character.realm.slug}:`, error);
            }
          }
          
        } catch (error) {
          console.error(`❌ Failed to process user ${user.id}:`, error);
        }
      }
      
      console.log(`🎉 Weekly reset completed! Processed ${resetCount} characters`);
      
    } catch (error) {
      console.error('❌ Weekly reset failed:', error);
      throw error;
    }
  }

  /**
   * Start the weekly reset scheduler
   */
  public startWeeklyResetScheduler(): void {
    console.log('⏰ Starting weekly reset scheduler...');
    
    // Check every hour if it's time for a reset
    setInterval(async () => {
      try {
        if (WeeklyResetService.isWeeklyResetTime()) {
          console.log('🔄 Weekly reset time detected!');
          await this.performWeeklyReset();
        }
      } catch (error) {
        console.error('❌ Weekly reset scheduler error:', error);
      }
    }, 60 * 60 * 1000); // Check every hour
    
    console.log('✅ Weekly reset scheduler started');
  }

  /**
   * Get reset status information
   */
  public getResetStatus(): {
    isResetTime: boolean;
    lastReset: Date;
    nextReset: Date;
    timeUntilReset: string;
  } {
    const isResetTime = WeeklyResetService.isWeeklyResetTime();
    const lastReset = new Date(WeeklyResetService.getLastResetTimestamp());
    const nextReset = new Date(WeeklyResetService.getNextResetTimestamp());
    
    const now = new Date();
    const timeUntilReset = nextReset.getTime() - now.getTime();
    
    const days = Math.floor(timeUntilReset / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeUntilReset % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeUntilReset % (1000 * 60 * 60)) / (1000 * 60));
    
    let timeString = '';
    if (days > 0) timeString += `${days}d `;
    if (hours > 0) timeString += `${hours}h `;
    if (minutes > 0) timeString += `${minutes}m`;
    
    return {
      isResetTime,
      lastReset,
      nextReset,
      timeUntilReset: timeString.trim() || '0m'
    };
  }
}
