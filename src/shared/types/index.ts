// Shared types and interfaces for the WoW Weekly Tracker

export interface BlizzardToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  refresh_token?: string;
  expires_at: number;
}

export interface BlizzardCharacter {
  id: number;
  name: string;
  realm: {
    id: number;
    slug: string;
    name: {
      en_US: string;
      [key: string]: string;
    };
  };
  playable_class: {
    id: number;
    name: {
      en_US: string;
      [key: string]: string;
    };
  };
  playable_race: {
    id: number;
    name: {
      en_US: string;
      [key: string]: string;
    };
  };
  level: number;
  faction: {
    type: 'ALLIANCE' | 'HORDE';
    name: {
      en_US: string;
      [key: string]: string;
    };
  };
}

export interface WeeklyActivity {
  id: string;
  name: string;
  type: 'MYTHIC_PLUS' | 'RAID' | 'QUEST' | 'PROFESSION' | 'ACHIEVEMENT';
  description: string;
  completed: boolean;
  completedAt?: Date;
  progress?: number;
  maxProgress?: number;
  resetDay: 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY' | 'MONDAY';
  error?: string;
  // Quest-specific details
  questDetails?: {
    completedQuests: Array<{
      name: string;
      completedAt: Date;
      hoursAgo: number;
    }>;
    totalQuestsThisWeek: number;
  };
}

export interface CharacterProgress {
  characterId: number;
  characterName: string;
  realm: string;
  race: string;
  className: string;
  level: number;
  faction: string;
  activities: WeeklyActivity[];
  lastUpdated: Date;
}

export interface UserProfile {
  id: string;
  battleTag: string;
  characters: BlizzardCharacter[];
  accessToken: BlizzardToken;
  lastLogin: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface BlizzardApiError {
  code: number;
  type: string;
  detail: string;
}

// Weekly activity types
export enum ActivityType {
  MYTHIC_PLUS = 'MYTHIC_PLUS',
  RAID = 'RAID',
  QUEST = 'QUEST',
  PROFESSION = 'PROFESSION',
  ACHIEVEMENT = 'ACHIEVEMENT'
}

export enum ResetDay {
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
  MONDAY = 'MONDAY'
}

// Configuration types
export interface AppConfig {
  blizzard: {
    clientId: string;
    clientSecret: string;
    apiBaseUrl: string;
    oauthUrl: string;
  };
  app: {
    port: number;
    frontendUrl: string;
    nodeEnv: string;
  };
  database: {
    path: string;
  };
  jwt: {
    secret: string;
  };
}
