import { WeeklyActivity } from '../../shared/types';
import { WEEKLY_ACTIVITIES } from '../../shared/constants';

export class WeeklyActivityService {
  /**
   * Generate default weekly activities for a character
   */
  static generateDefaultActivities(characterId: number): WeeklyActivity[] {
    const activities: WeeklyActivity[] = [];
    
    // Add all weekly activities
    Object.values(WEEKLY_ACTIVITIES).forEach(activity => {
      activities.push({
        id: `${characterId}_${activity.id}`,
        name: activity.name,
        type: activity.type,
        description: activity.description,
        completed: false,
        progress: 0,
        maxProgress: 1,
        resetDay: activity.resetDay
      });
    });
    
    return activities;
  }

  /**
   * Check if activities need to be reset (weekly reset)
   */
  static shouldResetActivities(lastReset: Date): boolean {
    const now = new Date();
    const daysSinceReset = Math.floor((now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceReset >= 7;
  }

  /**
   * Reset all activities for a character
   */
  static resetActivities(activities: WeeklyActivity[]): WeeklyActivity[] {
    return activities.map(activity => ({
      ...activity,
      completed: false,
      progress: 0,
      completedAt: undefined
    }));
  }
}
