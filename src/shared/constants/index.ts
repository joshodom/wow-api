// Shared constants for the WoW Weekly Tracker

export const BLIZZARD_API_ENDPOINTS = {
  OAUTH_TOKEN: '/oauth/token',
  OAUTH_AUTHORIZE: '/oauth/authorize',
  CHARACTER_PROFILE: '/profile/wow/character',
  CHARACTER_ACHIEVEMENTS: '/profile/wow/character/{realm}/{name}/achievements',
  CHARACTER_MYTHIC_PLUS: '/profile/wow/character/{realm}/{name}/mythic-keystone-profile',
  CHARACTER_RAIDS: '/profile/wow/character/{realm}/{name}/encounters/raids',
  CHARACTER_QUESTS: '/profile/wow/character/{realm}/{name}/quests',
  CHARACTER_PVP: '/profile/wow/character/{realm}/{name}/pvp-summary',
  REALM_INDEX: '/data/wow/realm/index',
  REALM: '/data/wow/realm/{realmSlug}',
  CLASS_INDEX: '/data/wow/playable-class/index',
  CLASS: '/data/wow/playable-class/{classId}',
  RACE_INDEX: '/data/wow/playable-race/index',
  RACE: '/data/wow/playable-race/{raceId}'
} as const;

export const WEEKLY_ACTIVITIES = {
  MYTHIC_PLUS: {
    id: 'mythic_plus_weekly',
    name: 'Mythic+ Weekly',
    type: 'MYTHIC_PLUS' as const,
    description: 'Complete a Mythic+ dungeon',
    resetDay: 'TUESDAY' as const
  },
  RAID_NORMAL: {
    id: 'raid_normal_weekly',
    name: 'Raid Normal Weekly',
    type: 'RAID' as const,
    description: 'Complete normal raid encounters',
    resetDay: 'TUESDAY' as const
  },
  RAID_HEROIC: {
    id: 'raid_heroic_weekly',
    name: 'Raid Heroic Weekly',
    type: 'RAID' as const,
    description: 'Complete heroic raid encounters',
    resetDay: 'TUESDAY' as const
  },
  RAID_MYTHIC: {
    id: 'raid_mythic_weekly',
    name: 'Raid Mythic Weekly',
    type: 'RAID' as const,
    description: 'Complete mythic raid encounters',
    resetDay: 'TUESDAY' as const
  },
  WEEKLY_QUEST: {
    id: 'weekly_quest',
    name: 'Weekly Quest',
    type: 'QUEST' as const,
    description: 'Complete weekly world quest',
    resetDay: 'TUESDAY' as const
  },
  PVP_WEEKLY: {
    id: 'pvp_weekly',
    name: 'PvP Weekly',
    type: 'PVP' as const,
    description: 'Complete PvP weekly objectives',
    resetDay: 'TUESDAY' as const
  }
} as const;

export const API_RATE_LIMITS = {
  REQUESTS_PER_SECOND: 100,
  REQUESTS_PER_HOUR: 36000,
  BURST_LIMIT: 1000
} as const;

export const TOKEN_EXPIRY_BUFFER = 300; // 5 minutes before expiry

export const DATABASE_SCHEMA_VERSION = 1;

export const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
} as const;
