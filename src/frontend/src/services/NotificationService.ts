// Notification service for WoW Weekly Tracker
export class NotificationService {
  private permissionGranted: boolean = false;

  constructor() {
    this.requestPermission();
  }

  private async requestPermission(): Promise<void> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      this.permissionGranted = permission === 'granted';
    }
  }

  /**
   * Show notification for completed activity
   */
  showActivityCompleted(characterName: string, activityName: string): void {
    if (!this.permissionGranted) return;

    new Notification('WoW Weekly Tracker', {
      body: `${characterName} completed ${activityName}!`,
      icon: '/favicon.ico',
      tag: `activity-${characterName}-${activityName}`
    });
  }

  /**
   * Show notification for incomplete activity
   */
  showActivityIncomplete(characterName: string, activityName: string): void {
    if (!this.permissionGranted) return;

    new Notification('WoW Weekly Tracker', {
      body: `${characterName} still needs to complete ${activityName}`,
      icon: '/favicon.ico',
      tag: `incomplete-${characterName}-${activityName}`
    });
  }

  /**
   * Show notification for weekly reset
   */
  showWeeklyReset(): void {
    if (!this.permissionGranted) return;

    new Notification('WoW Weekly Tracker', {
      body: 'Weekly activities have reset! Check your progress.',
      icon: '/favicon.ico',
      tag: 'weekly-reset'
    });
  }

  /**
   * Check if notifications are supported
   */
  isSupported(): boolean {
    return 'Notification' in window;
  }

  /**
   * Check if permission is granted
   */
  hasPermission(): boolean {
    return this.permissionGranted;
  }
}

export const notificationService = new NotificationService();
