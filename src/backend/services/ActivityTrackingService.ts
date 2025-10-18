import { WeeklyActivity } from '../../shared/types';
import { WEEKLY_ACTIVITIES } from '../../shared/constants';

export interface ActivityData {
  mythicPlus?: any;
  raids?: any;
  pvp?: any;
  quests?: any;
  achievements?: any;
  errors?: {
    mythicPlus?: string | null;
    raids?: string | null;
    pvp?: string | null;
    quests?: string | null;
    achievements?: string | null;
  };
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

      // Determine completion based on activity type and check for errors
      switch (activityTemplate.type) {
        case 'MYTHIC_PLUS':
          if (activityData.errors?.mythicPlus) {
            activity.error = activityData.errors.mythicPlus;
          } else {
            activity.completed = this.checkMythicPlusCompletion(activityData.mythicPlus);
          }
          break;
        case 'RAID':
          if (activityData.errors?.raids) {
            activity.error = activityData.errors.raids;
          } else {
            activity.completed = this.checkRaidCompletion(activityData.raids, activityTemplate.id);
          }
          break;
        case 'PVP':
          if (activityData.errors?.pvp) {
            activity.error = activityData.errors.pvp;
          } else {
            activity.completed = this.checkPvpCompletion(activityData.pvp);
          }
          break;
            case 'QUEST':
              if (activityData.errors?.quests) {
                activity.error = activityData.errors.quests;
              } else {
                const questResult = this.checkQuestCompletion(activityData.quests);
                activity.completed = questResult.completed;
                if (questResult.questDetails) {
                  activity.questDetails = questResult.questDetails;
                }
              }
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

      // Check if there are any completed runs in the current period
      const completedRuns = currentPeriod.best_runs || [];
      
      // If no runs in current period, check if there are any recent runs in seasons
      if (completedRuns.length === 0 && mythicPlusData.seasons && mythicPlusData.seasons.length > 0) {
        const latestSeason = mythicPlusData.seasons[0];
        if (latestSeason.best_runs && latestSeason.best_runs.length > 0) {
          // Check if any runs were completed this week
          const thisWeek = this.getThisWeekTimestamp();
          const hasRecentRun = latestSeason.best_runs.some((run: any) => 
            run.completed_timestamp && run.completed_timestamp >= thisWeek
          );
          
          if (hasRecentRun) {
            console.log(`✅ Found Mythic+ run completed this week`);
            return true;
          }
        }
      }
      
      return completedRuns.length > 0;
    } catch (error) {
      console.error('Error checking Mythic+ completion:', error);
      return false;
    }
  }

  /**
   * Get timestamp for the start of this week (Tuesday reset)
   */
  private static getThisWeekTimestamp(): number {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Calculate days since last Tuesday (reset day)
    const daysSinceTuesday = (dayOfWeek + 5) % 7; // Tuesday = 2, so (2 + 5) % 7 = 0
    
    // Get the start of this week's reset (Tuesday at 10 AM UTC)
    const thisWeekReset = new Date(now);
    thisWeekReset.setUTCDate(now.getUTCDate() - daysSinceTuesday);
    thisWeekReset.setUTCHours(10, 0, 0, 0); // 10 AM UTC reset time
    
    return thisWeekReset.getTime();
  }

  /**
   * Check if Raid weekly activity is completed
   */
  private static checkRaidCompletion(raidData: any, activityId: string): boolean {
    if (!raidData) return false;

    try {
      // Determine difficulty based on activity ID
      const difficulty = this.getRaidDifficulty(activityId);
      console.log(`Checking ${difficulty} raid completion...`);
      
      // Check if character has completed any raid encounters this week
      const expansions = raidData.expansions || [];
      
      // Look through all expansions for completed raids
      for (const expansion of expansions) {
        if (expansion.instances && expansion.instances.length > 0) {
          for (const instance of expansion.instances) {
            if (instance.modes && instance.modes.length > 0) {
              for (const mode of instance.modes) {
                // Check if this mode matches our difficulty and is completed
                if (this.matchesRaidDifficulty(mode.difficulty, difficulty) && 
                    mode.status?.type === 'COMPLETE') {
                  
                  // Check if any encounters were completed this week
                  if (mode.progress?.encounters) {
                    const thisWeek = this.getThisWeekTimestamp();
                    const hasRecentCompletion = mode.progress.encounters.some((encounter: any) => 
                      encounter.last_kill_timestamp && encounter.last_kill_timestamp >= thisWeek
                    );
                    
                    if (hasRecentCompletion) {
                      console.log(`✅ Found ${difficulty} raid completion this week in ${instance.instance?.name || 'Unknown'}`);
                      return true;
                    }
                  }
                }
              }
            }
          }
        }
      }
      
      console.log(`❌ No ${difficulty} raid completions found this week`);
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
   * Check if Quest weekly activity is completed and return quest details
   */
  private static checkQuestCompletion(questData: any): { completed: boolean; questDetails?: any } {
    if (!questData) return { completed: false };

    try {
      // The quest API returns completed quests with timestamps
      // Check if character has completed any quests this week
      const quests = questData.quests || [];
      
      if (quests.length === 0) {
        console.log('No completed quests found');
        return { completed: false };
      }
      
      // Get this week's timestamp (Tuesday 10 AM UTC reset)
      const thisWeek = this.getThisWeekTimestamp();
      
      // Check if any quests were completed this week
      const thisWeekQuests = quests.filter((quest: any) => 
        quest.completed_timestamp && quest.completed_timestamp >= thisWeek
      );
      
      console.log(`Found ${thisWeekQuests.length} quests completed this week out of ${quests.length} total`);
      
      // If any quests were completed this week, consider weekly quest activity as completed
      // This is a simple but effective heuristic for weekly quest tracking
      const hasWeeklyActivity = thisWeekQuests.length > 0;
      
      if (hasWeeklyActivity) {
        console.log('✅ Weekly quest activity completed - character completed quests this week');
        
        // Prepare quest details for the UI
        const questDetails = {
          completedQuests: thisWeekQuests
            .sort((a: any, b: any) => b.completed_timestamp - a.completed_timestamp)
            .map((quest: any) => {
              const questName = quest.quest?.name?.en_US || 'Unknown';
              const completedDate = new Date(quest.completed_timestamp);
              const hoursAgo = Math.floor((Date.now() - quest.completed_timestamp) / (1000 * 60 * 60));
              
              return {
                name: questName,
                completedAt: completedDate,
                hoursAgo: hoursAgo
              };
            }),
          totalQuestsThisWeek: thisWeekQuests.length
        };
        
        // Log some of the recent quests for debugging
        questDetails.completedQuests.slice(0, 3).forEach((quest: any, index: number) => {
          console.log(`  ${index + 1}. ${quest.name} (${quest.hoursAgo}h ago)`);
        });
        
        return { completed: true, questDetails };
      } else {
        console.log('❌ Weekly quest activity not completed - no quests completed this week');
        return { completed: false };
      }
    } catch (error) {
      console.error('Error checking Quest completion:', error);
      return { completed: false };
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
   * Check if a mode difficulty matches our target difficulty
   */
  private static matchesRaidDifficulty(modeDifficulty: any, targetDifficulty: string): boolean {
    if (!modeDifficulty || !targetDifficulty) return false;
    
    const difficultyName = modeDifficulty.name?.en_US || '';
    const difficultyType = modeDifficulty.type || '';
    
    switch (targetDifficulty) {
      case 'Normal':
        // Normal difficulty can be "Normal" or "Raid Finder" (LFR)
        return difficultyName === 'Normal' || difficultyType === 'NORMAL' || difficultyType === 'LFR';
      case 'Heroic':
        // Heroic difficulty
        return difficultyName === 'Heroic' || difficultyType === 'HEROIC';
      case 'Mythic':
        // Mythic difficulty
        return difficultyName === 'Mythic' || difficultyType === 'MYTHIC';
      default:
        return false;
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
