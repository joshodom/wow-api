import { WeeklyActivity } from '../../shared/types';
import { WEEKLY_ACTIVITIES } from '../../shared/constants';

export interface ActivityData {
  mythicPlus?: any;
  raids?: any;
  pvp?: any;
  quests?: any;
  achievements?: any;
}

export class ActivityTrackingService {
  /**
   * Analyze character data and determine weekly activity completion status
   */
  static analyzeWeeklyActivities(characterId: number, activityData: ActivityData): WeeklyActivity[] {
    const activities: WeeklyActivity[] = [];

    // Generate activities based on available data
    Object.values(WEEKLY_ACTIVITIES).forEach(activityTemplate => {
      const activity: WeeklyActivity = {
        id: `${characterId}_${activityTemplate.id}`,
        name: activityTemplate.name,
        type: activityTemplate.type,
        description: activityTemplate.description,
        completed: false,
        progress: 0,
        maxProgress: 1,
        resetDay: activityTemplate.resetDay
      };

      // Determine completion based on activity type
      switch (activityTemplate.type) {
        case 'MYTHIC_PLUS':
          activity.completed = this.checkMythicPlusCompletion(activityData.mythicPlus);
          break;
        case 'RAID':
          activity.completed = this.checkRaidCompletion(activityData.raids, activityTemplate.id);
          break;
        case 'PVP':
          activity.completed = this.checkPvpCompletion(activityData.pvp);
          break;
        case 'QUEST':
          activity.completed = this.checkQuestCompletion(activityData.quests);
          break;
        default:
          console.warn(`Unknown activity type: ${activityTemplate.type}`);
          activity.completed = false;
          break;
      }

      activities.push(activity);
    });

    return activities;
  }

  /**
   * Check if Mythic+ weekly activity is completed
   */
  private static checkMythicPlusCompletion(mythicPlusData: any): boolean {
    if (!mythicPlusData) return false;

    try {
      // Check if character has completed any Mythic+ runs this week
      const currentPeriod = mythicPlusData.current_period;
      if (!currentPeriod) return false;

      // Check if there are any completed runs
      const completedRuns = currentPeriod.best_runs || [];
      return completedRuns.length > 0;
    } catch (error) {
      console.error('Error checking Mythic+ completion:', error);
      return false;
    }
  }

  /**
   * Check if Raid weekly activity is completed
   */
  private static checkRaidCompletion(raidData: any, activityId: string): boolean {
    if (!raidData) return false;

    try {
      // Determine difficulty based on activity ID
      const difficulty = this.getRaidDifficulty(activityId);
      
      // Check if character has completed any raid encounters this week
      const expansions = raidData.expansions || [];
      
      for (const expansion of expansions) {
        const instances = expansion.instances || [];
        for (const instance of instances) {
          const modes = instance.modes || [];
          for (const mode of modes) {
            if (mode.difficulty?.name === difficulty) {
              const encounters = mode.progress?.encounters || [];
              return encounters.some((encounter: any) => encounter.completed === true);
            }
          }
        }
      }

      return false;
    } catch (error) {
      console.error('Error checking Raid completion:', error);
      return false;
    }
  }

  /**
   * Check if PvP weekly activity is completed
   */
  private static checkPvpCompletion(pvpData: any): boolean {
    if (!pvpData) return false;

    try {
      // Check if character has gained honor or completed PvP objectives this week
      const honorLevel = pvpData.honor_level || 0;
      const honorProgress = pvpData.honor_progress || 0;
      
      // Simple check: if honor level > 0 or honor progress > 0, consider it completed
      return honorLevel > 0 || honorProgress > 0;
    } catch (error) {
      console.error('Error checking PvP completion:', error);
      return false;
    }
  }

  /**
   * Check if Quest weekly activity is completed
   */
  private static checkQuestCompletion(questData: any): boolean {
    if (!questData) return false;

    try {
      // Check if character has completed any quests this week
      const quests = questData.quests || [];
      
      // Look for weekly quests or world quests
      const weeklyQuests = quests.filter((quest: any) => 
        quest.name?.includes('Weekly') || 
        quest.name?.includes('World Quest') ||
        quest.category?.name === 'Weekly'
      );

      return weeklyQuests.length > 0;
    } catch (error) {
      console.error('Error checking Quest completion:', error);
      return false;
    }
  }

  /**
   * Get raid difficulty based on activity ID
   */
  private static getRaidDifficulty(activityId: string): string {
    switch (activityId) {
      case 'raid_normal_weekly':
        return 'Normal';
      case 'raid_heroic_weekly':
        return 'Heroic';
      case 'raid_mythic_weekly':
        return 'Mythic';
      default:
        return 'Normal';
    }
  }

  /**
   * Get the current week start timestamp (Tuesday reset)
   */
  static getCurrentWeekStart(): Date {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Calculate days since last Tuesday (day 2)
    let daysSinceTuesday = (dayOfWeek + 6) % 7; // Convert to Monday = 0, Tuesday = 1, etc.
    if (daysSinceTuesday === 0) daysSinceTuesday = 7; // If it's Tuesday, we want 0 days
    
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - daysSinceTuesday);
    weekStart.setHours(15, 0, 0, 0); // 3 PM UTC (typical reset time)
    
    return weekStart;
  }

  /**
   * Check if activities need to be reset for a new week
   */
  static shouldResetActivities(lastReset: Date): boolean {
    const currentWeekStart = this.getCurrentWeekStart();
    return lastReset < currentWeekStart;
  }
}
