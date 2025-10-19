// Shared constants for the WoW Weekly Tracker

export const BLIZZARD_API_ENDPOINTS = {
  OAUTH_TOKEN: '/oauth/token',
  OAUTH_AUTHORIZE: '/oauth/authorize',
  CHARACTER_PROFILE: '/profile/wow/character',
  CHARACTER_ACHIEVEMENTS: '/profile/wow/character/{realm}/{name}/achievements',
  CHARACTER_MYTHIC_PLUS: '/profile/wow/character/{realm}/{name}/mythic-keystone-profile',
  CHARACTER_RAIDS: '/profile/wow/character/{realm}/{name}/encounters/raids',
  CHARACTER_QUESTS: '/profile/wow/character/{realm}/{name}/quests',
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
    name: 'Normal Raid',
    type: 'RAID' as const,
    description: 'Complete normal difficulty raid encounters',
    resetDay: 'TUESDAY' as const
  },
  RAID_HEROIC: {
    id: 'raid_heroic_weekly',
    name: 'Heroic Raid',
    type: 'RAID' as const,
    description: 'Complete heroic difficulty raid encounters',
    resetDay: 'TUESDAY' as const
  },
  RAID_MYTHIC: {
    id: 'raid_mythic_weekly',
    name: 'Mythic Raid',
    type: 'RAID' as const,
    description: 'Complete mythic difficulty raid encounters',
    resetDay: 'TUESDAY' as const
  },
  WEEKLY_QUEST: {
    id: 'weekly_quest',
    name: 'Weekly Quest',
    type: 'QUEST' as const,
    description: 'Complete weekly world quest',
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

// Weekly Quest Definitions
export const WEEKLY_QUESTS = {
  // The War Within - Always Available
  WORLD_SOUL: {
    id: 'world_soul',
    name: 'The Call of the World Soul',
    zone: 'Dornogal',
    objectives: [
      'Complete one of four available tasks',
      'Earn a cache with crests, valorstones, and gear'
    ],
    category: 'WEEKLY_STATIC' as const
  },
  SPECIAL_ASSIGNMENT: {
    id: 'special_assignment',
    name: 'Special Assignment',
    zone: 'Any Zone',
    objectives: [
      'Complete 3 World Quests in a zone',
      'Complete the unlocked Special Assignment'
    ],
    category: 'WEEKLY_STATIC' as const
  },
  AWAKENING_MACHINE: {
    id: 'awakening_machine',
    name: 'Awakening the Machine',
    zone: 'Gundargaz, Isle of Dorn',
    objectives: [
      'Survive 20 waves of enemies',
      'Earn Awakened Mechanical Cache',
      'Chance at Machine Defense Unit 1-11 mount'
    ],
    category: 'WEEKLY_STATIC' as const
  },
  SPREADING_LIGHT: {
    id: 'spreading_light',
    name: 'Spreading the Light',
    zone: 'Hallowfall',
    objectives: [
      'Collect Radiant Remnants',
      'Light Lesser Keyflames',
      'Earn Radiant Cache with crests and resources'
    ],
    category: 'WEEKLY_STATIC' as const
  },
  THEATER_TROUPE: {
    id: 'theater_troupe',
    name: 'Theater Troupe',
    zone: 'Isle of Dorn',
    objectives: [
      'Participate in performance events',
      'Complete tasks and final boss fight',
      'Earn Theater Troupe\'s Trove with gear and reputation'
    ],
    category: 'WEEKLY_STATIC' as const
  },
  DUNGEON_WEEKLY: {
    id: 'dungeon_weekly',
    name: 'Weekly Dungeon Quest',
    zone: 'Dornogal',
    objectives: [
      'Complete the specified dungeon',
      'Earn 1,500 reputation with chosen faction'
    ],
    category: 'WEEKLY_STATIC' as const
  },
  PVP_WEEKLY: {
    id: 'pvp_weekly',
    name: 'Weekly PvP Quest',
    zone: 'Dornogal',
    objectives: [
      'Complete PvP objectives',
      'Earn Honor and reputation'
    ],
    category: 'WEEKLY_STATIC' as const
  },
  DELVES_WEEKLY: {
    id: 'delves_weekly',
    name: 'Delves Weekly',
    zone: 'Khaz Algar',
    objectives: [
      'Complete 4 Bountiful Delves',
      'Earn rewards and reputation'
    ],
    category: 'WEEKLY_STATIC' as const
  }
} as const;

// Bonus Event Rotation (7-week cycle)
export const BONUS_EVENTS = {
  BATTLEGROUNDS: {
    id: 'battlegrounds',
    name: 'Battleground Bonus Event',
    objectives: [
      'Win 4 Random Battlegrounds',
      'Earn bonus Honor and a reward cache'
    ],
    week: 1
  },
  MYTHIC_DUNGEONS: {
    id: 'mythic_dungeons',
    name: 'Mythic Dungeon Bonus Event',
    objectives: [
      'Complete 4 Mythic Dungeons',
      'Earn bonus loot and a reward cache'
    ],
    week: 2
  },
  PET_BATTLES: {
    id: 'pet_battles',
    name: 'Pet Battle Bonus Event',
    objectives: [
      'Win 5 Pet Battles',
      'Earn Pet Battle experience boost and rewards'
    ],
    week: 3
  },
  TIMEWALKING: {
    id: 'timewalking',
    name: 'Timewalking Bonus Event',
    objectives: [
      'Complete 5 Timewalking Dungeons',
      'Complete Timewalking Raid (when available)',
      'Earn Timewalking Badges and gear'
    ],
    week: 4
  },
  ARENA_SKIRMISHES: {
    id: 'arena_skirmishes',
    name: 'Arena Skirmish Bonus Event',
    objectives: [
      'Win 3 Arena Skirmishes',
      'Earn bonus Honor and a reward cache'
    ],
    week: 5
  },
  MYTHIC_PLUS: {
    id: 'mythic_plus',
    name: 'Mythic+ Dungeon Bonus Event',
    objectives: [
      'Complete 4 Mythic+ Dungeons',
      'Earn bonus rewards and Great Vault progress'
    ],
    week: 6
  },
  WORLD_QUESTS: {
    id: 'world_quests',
    name: 'World Quest Bonus Event',
    objectives: [
      'Complete 20 World Quests',
      'Earn 50% bonus reputation from World Quests'
    ],
    week: 7
  }
} as const;

// Reference date for rotation calculation (a known Week 1 date)
// This should be a Tuesday (weekly reset day) that was a Battlegrounds week
export const BONUS_EVENT_REFERENCE_DATE = new Date('2024-01-02T15:00:00Z'); // Example reference date
