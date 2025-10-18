import { DatabaseService } from '../database/DatabaseService';
import { BlizzardApiService } from '../api/BlizzardApiService';
import { ActivityTrackingService } from './ActivityTrackingService';
import { WeeklyResetService } from './WeeklyResetService';

export interface RefreshConfig {
  intervalMinutes: number;
  batchSize: number;
  retryAttempts: number;
  retryDelayMs: number;
  enableNotifications: boolean;
  enableProgressTracking: boolean;
}

export interface RefreshStats {
  totalUsers: number;
  totalCharacters: number;
  successfulRefreshes: number;
  failedRefreshes: number;
  lastRefreshTime: Date;
  nextRefreshTime: Date;
  averageRefreshTimeMs: number;
}

export class AutoRefreshService {
  private static instance: AutoRefreshService;
  private dbService: DatabaseService;
  private apiService: BlizzardApiService;
  private weeklyResetService: WeeklyResetService;
  private config: RefreshConfig;
  private stats: RefreshStats;
  private refreshInterval: NodeJS.Timeout | null = null;
  private isRefreshing: boolean = false;

  private constructor(
    dbService: DatabaseService, 
    apiService: BlizzardApiService, 
    weeklyResetService: WeeklyResetService,
    config: RefreshConfig
  ) {
    this.dbService = dbService;
    this.apiService = apiService;
    this.weeklyResetService = weeklyResetService;
    this.config = config;
    this.stats = {
      totalUsers: 0,
      totalCharacters: 0,
      successfulRefreshes: 0,
      failedRefreshes: 0,
      lastRefreshTime: new Date(),
      nextRefreshTime: new Date(),
      averageRefreshTimeMs: 0
    };
  }

  public static getInstance(
    dbService?: DatabaseService, 
    apiService?: BlizzardApiService, 
    weeklyResetService?: WeeklyResetService,
    config?: RefreshConfig
  ): AutoRefreshService {
    if (!AutoRefreshService.instance) {
      if (!dbService || !apiService || !weeklyResetService) {
        throw new Error('All services are required for AutoRefreshService initialization');
      }
      const defaultConfig: RefreshConfig = {
        intervalMinutes: 30,
        batchSize: 5,
        retryAttempts: 3,
        retryDelayMs: 5000,
        enableNotifications: true,
        enableProgressTracking: true
      };
      AutoRefreshService.instance = new AutoRefreshService(
        dbService, 
        apiService, 
        weeklyResetService, 
        config || defaultConfig
      );
    }
    return AutoRefreshService.instance;
  }

  /**
   * Start the auto-refresh system
   */
  public start(): void {
    if (this.refreshInterval) {
      console.log('⚠️ Auto-refresh system is already running');
      return;
    }

    console.log(`🔄 Starting auto-refresh system (${this.config.intervalMinutes} minute intervals)`);
    
    // Initial refresh
    this.performRefresh();
    
    // Set up interval
    this.refreshInterval = setInterval(() => {
      this.performRefresh();
    }, this.config.intervalMinutes * 60 * 1000);

    console.log('✅ Auto-refresh system started');
  }

  /**
   * Stop the auto-refresh system
   */
  public stop(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
      console.log('⏹️ Auto-refresh system stopped');
    }
  }

  /**
   * Perform a manual refresh
   */
  public async performManualRefresh(): Promise<RefreshStats> {
    console.log('🔄 Manual refresh triggered');
    await this.performRefresh();
    return this.getStats();
  }

  /**
   * Get current refresh statistics
   */
  public getStats(): RefreshStats {
    return { ...this.stats };
  }

  /**
   * Update refresh configuration
   */
  public updateConfig(newConfig: Partial<RefreshConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Auto-refresh configuration updated:', this.config);
  }

  /**
   * Perform the actual refresh operation
   */
  private async performRefresh(): Promise<void> {
    if (this.isRefreshing) {
      console.log('⚠️ Refresh already in progress, skipping...');
      return;
    }

    const startTime = Date.now();
    this.isRefreshing = true;

    try {
      console.log('🔄 Starting automatic data refresh...');
      
      // Get all users
      const users = await this.dbService.getAllUsers();
      this.stats.totalUsers = users.length;
      this.stats.totalCharacters = 0;
      this.stats.successfulRefreshes = 0;
      this.stats.failedRefreshes = 0;

      if (users.length === 0) {
        console.log('📊 No users found for refresh');
        return;
      }

      // Process users in batches
      const batches = this.createBatches(users, this.config.batchSize);
      
      for (const batch of batches) {
        await this.processBatch(batch);
        
        // Small delay between batches to avoid overwhelming the API
        if (batches.indexOf(batch) < batches.length - 1) {
          await this.delay(1000);
        }
      }

      // Update statistics
      const refreshTime = Date.now() - startTime;
      this.stats.lastRefreshTime = new Date();
      this.stats.nextRefreshTime = new Date(Date.now() + (this.config.intervalMinutes * 60 * 1000));
      this.stats.averageRefreshTimeMs = refreshTime;

      console.log(`🎉 Automatic data refresh completed in ${refreshTime}ms`);
      console.log(`📊 Stats: ${this.stats.successfulRefreshes}/${this.stats.totalCharacters} characters refreshed successfully`);

    } catch (error) {
      console.error('❌ Auto-refresh failed:', error);
      this.stats.failedRefreshes++;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Process a batch of users
   */
  private async processBatch(users: any[]): Promise<void> {
    const batchPromises = users.map(user => this.processUser(user));
    await Promise.allSettled(batchPromises);
  }

  /**
   * Process a single user
   */
  private async processUser(user: any): Promise<void> {
    try {
      // Check if user has valid access token
      if (!user.accessToken || !user.accessToken.access_token) {
        console.log(`⚠️ Skipping user ${user.id} - no valid tokens`);
        return;
      }

      const accessToken = user.accessToken.access_token;
      
      // Get fresh character data
      const characters = await this.apiService.getCharacterList(accessToken);
      if (!characters || characters.length === 0) {
        console.log(`⚠️ No characters found for user ${user.id}`);
        return;
      }

      this.stats.totalCharacters += characters.length;

      // Process each character
      for (const character of characters) {
        await this.processCharacter(character, accessToken);
      }

    } catch (error) {
      console.error(`❌ Failed to process user ${user.id}:`, error);
      this.stats.failedRefreshes++;
    }
  }

  /**
   * Process a single character
   */
  private async processCharacter(character: any, accessToken: string): Promise<void> {
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
      
      this.stats.successfulRefreshes++;
      
      // Log progress for completed activities
      if (this.config.enableProgressTracking) {
        const completedCount = activities.filter(a => a.completed).length;
        if (completedCount > 0) {
          console.log(`✅ ${character.name}@${character.realm.slug}: ${completedCount}/${activities.length} activities completed`);
        }
      }

    } catch (error) {
      console.error(`❌ Failed to refresh ${character.name}@${character.realm.slug}:`, error);
      this.stats.failedRefreshes++;
    }
  }

  /**
   * Create batches from an array
   */
  private createBatches<T>(array: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Delay execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if refresh is currently running
   */
  public isRunning(): boolean {
    return this.isRefreshing;
  }

  /**
   * Get time until next refresh
   */
  public getTimeUntilNextRefresh(): number {
    return this.stats.nextRefreshTime.getTime() - Date.now();
  }

  /**
   * Force immediate refresh (bypasses interval)
   */
  public async forceRefresh(): Promise<void> {
    console.log('🔄 Force refresh triggered');
    await this.performRefresh();
  }
}
