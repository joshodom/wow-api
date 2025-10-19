import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import { UserProfile, BlizzardToken, CharacterProgress, WeeklyActivity } from '../../shared/types';
import { DATABASE_SCHEMA_VERSION } from '../../shared/constants';

export class DatabaseService {
  private db: sqlite3.Database;
  private dbRun: (sql: string, params?: any[]) => Promise<sqlite3.RunResult>;
  private dbGet: (sql: string, params?: any[]) => Promise<any>;
  private dbAll: (sql: string, params?: any[]) => Promise<any[]>;

  constructor(dbPath: string) {
    this.db = new sqlite3.Database(dbPath);
    this.dbRun = promisify(this.db.run.bind(this.db));
    this.dbGet = promisify(this.db.get.bind(this.db));
    this.dbAll = promisify(this.db.all.bind(this.db));
    
    this.initializeDatabase();
  }

  /**
   * Migrate the weekly_activities table to remove the UNIQUE constraint
   */
  private async migrateWeeklyActivitiesTable(): Promise<void> {
    try {
      // Check if the old table exists with the constraint
      const tableInfo = await this.dbAll(`
        SELECT sql FROM sqlite_master WHERE type='table' AND name='weekly_activities'
      `);
      
      if (tableInfo.length > 0 && tableInfo[0].sql.includes('UNIQUE(character_id, activity_type, week_start)')) {
        console.log('Migrating weekly_activities table to remove UNIQUE constraint...');
        
        // Create backup of existing data
        await this.dbRun(`
          CREATE TABLE IF NOT EXISTS weekly_activities_backup AS SELECT * FROM weekly_activities
        `);
        
        // Drop the old table
        await this.dbRun(`DROP TABLE weekly_activities`);
        
        // Recreate with new schema (without UNIQUE constraint)
        await this.dbRun(`
          CREATE TABLE weekly_activities (
            id TEXT PRIMARY KEY,
            character_id INTEGER NOT NULL,
            activity_type TEXT NOT NULL,
            activity_name TEXT NOT NULL,
            description TEXT,
            completed INTEGER NOT NULL DEFAULT 0,
            completed_at INTEGER,
            progress INTEGER DEFAULT 0,
            max_progress INTEGER DEFAULT 0,
            reset_day TEXT NOT NULL,
            week_start INTEGER NOT NULL,
            created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
            updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
            FOREIGN KEY (character_id) REFERENCES characters (id)
          )
        `);
        
        // Restore data from backup
        await this.dbRun(`
          INSERT INTO weekly_activities SELECT * FROM weekly_activities_backup
        `);
        
        // Drop backup table
        await this.dbRun(`DROP TABLE weekly_activities_backup`);
        
        console.log('✅ Migration complete: weekly_activities table updated');
      }
    } catch (error) {
      console.error('Failed to migrate weekly_activities table:', error);
      // Don't throw - let the app continue with existing schema
    }
  }

  /**
   * Initialize database tables
   */
  private async initializeDatabase(): Promise<void> {
    try {
      // Run migration first
      await this.migrateWeeklyActivitiesTable();
      
      // Users table
      await this.dbRun(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          battle_tag TEXT UNIQUE NOT NULL,
          access_token TEXT NOT NULL,
          refresh_token TEXT,
          token_expires_at INTEGER NOT NULL,
          last_login INTEGER NOT NULL,
          created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
          updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
        )
      `);

      // Characters table
      await this.dbRun(`
        CREATE TABLE IF NOT EXISTS characters (
          id INTEGER PRIMARY KEY,
          user_id TEXT NOT NULL,
          name TEXT NOT NULL,
          realm TEXT NOT NULL,
          class_id INTEGER NOT NULL,
          class_name TEXT NOT NULL,
          race_id INTEGER NOT NULL,
          race_name TEXT NOT NULL,
          level INTEGER NOT NULL,
          faction TEXT NOT NULL,
          created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
          updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
          FOREIGN KEY (user_id) REFERENCES users (id),
          UNIQUE(user_id, name, realm)
        )
      `);

      // Weekly activities table
      await this.dbRun(`
        CREATE TABLE IF NOT EXISTS weekly_activities (
          id TEXT PRIMARY KEY,
          character_id INTEGER NOT NULL,
          activity_type TEXT NOT NULL,
          activity_name TEXT NOT NULL,
          description TEXT,
          completed INTEGER NOT NULL DEFAULT 0,
          completed_at INTEGER,
          progress INTEGER DEFAULT 0,
          max_progress INTEGER DEFAULT 0,
          reset_day TEXT NOT NULL,
          week_start INTEGER NOT NULL,
          created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
          updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
          FOREIGN KEY (character_id) REFERENCES characters (id)
        )
      `);

      // Schema version tracking
      await this.dbRun(`
        CREATE TABLE IF NOT EXISTS schema_version (
          version INTEGER PRIMARY KEY,
          applied_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
        )
      `);

      // Insert current schema version
      await this.dbRun(`
        INSERT OR IGNORE INTO schema_version (version) VALUES (?)
      `, [DATABASE_SCHEMA_VERSION]);

      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * Save or update user profile
   */
  async saveUserProfile(userProfile: UserProfile): Promise<void> {
    try {
      await this.dbRun(`
        INSERT OR REPLACE INTO users (
          id, battle_tag, access_token, refresh_token, token_expires_at, last_login, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, strftime('%s', 'now'))
      `, [
        userProfile.id,
        userProfile.battleTag,
        JSON.stringify(userProfile.accessToken),
        userProfile.accessToken.refresh_token || null,
        userProfile.accessToken.expires_at,
        userProfile.lastLogin.getTime()
      ]);

      // Save characters
      for (const character of userProfile.characters) {
        await this.dbRun(`
          INSERT OR REPLACE INTO characters (
            id, user_id, name, realm, class_id, class_name, race_id, race_name, level, faction, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, strftime('%s', 'now'))
        `, [
          character.id,
          userProfile.id,
          character.name,
          character.realm.slug,
          character.playable_class.id,
          character.playable_class.name.en_US,
          character.playable_race.id,
          character.playable_race.name.en_US,
          character.level,
          character.faction.type
        ]);
      }
    } catch (error) {
      console.error('Failed to save user profile:', error);
      throw error;
    }
  }

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const user = await this.dbGet(`
        SELECT * FROM users WHERE id = ?
      `, [userId]);

      if (!user) {
        return null;
      }

      const characters = await this.dbAll(`
        SELECT * FROM characters WHERE user_id = ?
      `, [userId]);

      return {
        id: user.id,
        battleTag: user.battle_tag,
        accessToken: JSON.parse(user.access_token),
        characters: characters.map(char => ({
          id: char.id,
          name: char.name,
          realm: {
            id: 0, // We don't store realm ID in characters table
            slug: char.realm,
            name: {
              en_US: char.realm
            }
          },
          playable_class: {
            id: char.class_id,
            name: {
              en_US: char.class_name
            }
          },
          playable_race: {
            id: char.race_id,
            name: {
              en_US: char.race_name
            }
          },
          level: char.level,
          faction: {
            type: char.faction,
            name: {
              en_US: char.faction
            }
          }
        })),
        lastLogin: new Date(user.last_login)
      };
    } catch (error) {
      console.error('Failed to get user profile:', error);
      throw error;
    }
  }

  /**
   * Get user profile by Battle Tag
   */
  async getUserProfileByBattleTag(battleTag: string): Promise<UserProfile | null> {
    try {
      const user = await this.dbGet(`
        SELECT * FROM users WHERE battle_tag = ?
      `, [battleTag]);

      if (!user) {
        return null;
      }

      return this.getUserProfile(user.id);
    } catch (error) {
      console.error('Failed to get user profile by battle tag:', error);
      throw error;
    }
  }

  /**
   * Save character progress
   */
  async saveCharacterProgress(progress: CharacterProgress): Promise<void> {
    try {
      const characterId = progress.characterId;
      const weekStart = this.getWeekStart();

      for (const activity of progress.activities) {
        await this.dbRun(`
          INSERT OR REPLACE INTO weekly_activities (
            id, character_id, activity_type, activity_name, description,
            completed, completed_at, progress, max_progress, reset_day,
            week_start, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, strftime('%s', 'now'))
        `, [
          `${characterId}_${activity.id}_${weekStart}`,
          characterId,
          activity.type,
          activity.name,
          activity.description,
          activity.completed ? 1 : 0,
          activity.completedAt?.getTime() || null,
          activity.progress || 0,
          activity.maxProgress || 0,
          activity.resetDay,
          weekStart
        ]);
      }
    } catch (error) {
      console.error('Failed to save character progress:', error);
      throw error;
    }
  }

  /**
   * Get character progress for current week
   */
  async getCharacterProgress(characterId: number): Promise<CharacterProgress | null> {
    try {
      const character = await this.dbGet(`
        SELECT * FROM characters WHERE id = ?
      `, [characterId]);

      if (!character) {
        return null;
      }

      const weekStart = this.getWeekStart();
      const activities = await this.dbAll(`
        SELECT * FROM weekly_activities 
        WHERE character_id = ? AND week_start = ?
        ORDER BY activity_type
      `, [characterId, weekStart]);

      return {
        characterId: character.id,
        characterName: character.name,
        realm: character.realm,
        race: character.race_name,
        className: character.class_name,
        level: character.level,
        faction: character.faction,
        activities: activities.map(activity => ({
          id: activity.id.split('_')[1], // Extract activity ID
          name: activity.activity_name,
          type: activity.activity_type as any,
          description: activity.description,
          completed: activity.completed === 1,
          completedAt: activity.completed_at ? new Date(activity.completed_at) : undefined,
          progress: activity.progress,
          maxProgress: activity.max_progress,
          resetDay: activity.reset_day as any
        })),
        lastUpdated: new Date(character.updated_at * 1000)
      };
    } catch (error) {
      console.error('Failed to get character progress:', error);
      throw error;
    }
  }

  /**
   * Get week start timestamp (Tuesday reset)
   */
  private getWeekStart(): number {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysSinceTuesday = (dayOfWeek + 5) % 7; // Tuesday is day 2, so (2 + 5) % 7 = 0
    
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - daysSinceTuesday);
    weekStart.setHours(15, 0, 0, 0); // 3 PM UTC reset time
    
    return Math.floor(weekStart.getTime() / 1000);
  }

  /**
   * Get all users for auto-refresh
   */
  async getAllUsers(): Promise<UserProfile[]> {
    const query = `
      SELECT * FROM users
    `;
    
    const users = await this.dbAll(query);
    return users.map(user => ({
      ...user,
      accessToken: user.accessToken ? JSON.parse(user.accessToken) : null,
      characters: user.characters ? JSON.parse(user.characters) : []
    }));
  }

  /**
   * Update character progress
   */
  async updateCharacterProgress(characterId: number, progress: CharacterProgress): Promise<void> {
    const query = `
      UPDATE characters 
      SET weekly_activities = ?, last_updated = ?
      WHERE id = ?
    `;
    
    await this.dbRun(query, [
      JSON.stringify(progress.activities),
      new Date().toISOString(),
      characterId
    ]);
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
