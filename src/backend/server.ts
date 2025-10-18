import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { BlizzardAuthService } from './auth/BlizzardAuthService';
import { BlizzardApiService } from './api/BlizzardApiService';
import { DatabaseService } from './database/DatabaseService';
import { JwtService } from './auth/JwtService';
import { ActivityTrackingService } from './services/ActivityTrackingService';
import { WeeklyResetService } from './services/WeeklyResetService';
import { AutoRefreshService } from './services/AutoRefreshService';
import { AppConfig, UserProfile } from '../shared/types';

// Load environment variables
dotenv.config();

class WoWWeeklyTrackerServer {
  private app: express.Application;
  private config: AppConfig;
  private authService: BlizzardAuthService;
  private apiService: BlizzardApiService;
  private databaseService: DatabaseService;
  private jwtService: JwtService;
  private weeklyResetService: WeeklyResetService;
  private autoRefreshService: AutoRefreshService;

  constructor() {
    this.app = express();
    this.config = this.loadConfig();
    this.authService = new BlizzardAuthService(
      this.config.blizzard.clientId,
      this.config.blizzard.clientSecret,
      this.config.blizzard.oauthUrl,
      this.config.blizzard.apiBaseUrl
    );
    this.apiService = new BlizzardApiService(this.config.blizzard.apiBaseUrl);
    this.databaseService = new DatabaseService(this.config.database.path);
    this.jwtService = new JwtService(this.config.jwt.secret);
    this.weeklyResetService = WeeklyResetService.getInstance(this.databaseService, this.apiService);
    this.autoRefreshService = AutoRefreshService.getInstance(this.databaseService, this.apiService, this.weeklyResetService);

    this.setupMiddleware();
    this.setupRoutes();
  }

  private loadConfig(): AppConfig {
    return {
      blizzard: {
        clientId: process.env.BLIZZARD_CLIENT_ID || '',
        clientSecret: process.env.BLIZZARD_CLIENT_SECRET || '',
        apiBaseUrl: process.env.BLIZZARD_API_BASE_URL || 'https://us.api.blizzard.com',
        oauthUrl: process.env.BLIZZARD_OAUTH_URL || 'https://us.battle.net'
      },
      app: {
        port: parseInt(process.env.PORT || '3001'),
        frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
        nodeEnv: process.env.NODE_ENV || 'development'
      },
      database: {
        path: process.env.DATABASE_PATH || './data/wow_tracker.db'
      },
      jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key'
      }
    };
  }

  private setupMiddleware(): void {
    // CORS configuration
    this.app.use(cors({
      origin: this.config.app.frontendUrl,
      credentials: true
    }));

    // Body parsing middleware
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Authentication routes
    this.app.get('/auth/login', (req, res) => {
      const redirectUri = `http://localhost:3001/auth/callback`;
      const authUrl = this.authService.getAuthorizationUrl(redirectUri);
      return res.json({ authUrl });
    });

    this.app.get('/auth/callback', async (req, res) => {
      try {
        const { code, state } = req.query;
        
        if (!code) {
          return res.status(400).json({ error: 'Authorization code is required' });
        }

        const redirectUri = `http://localhost:3001/auth/callback`;
        const token = await this.authService.exchangeCodeForToken(code as string, redirectUri);
        
        // Get user's character list
        console.log('Fetching character list with access token:', token.access_token.substring(0, 20) + '...');
        const characters = await this.apiService.getCharacterList(token.access_token);
        console.log('Retrieved characters:', characters.length, 'characters');
        
        // Fetch activity data for each character
        console.log('🔄 Fetching activity data for all characters...');
        for (const character of characters) {
          try {
            console.log(`📊 Fetching activities for ${character.name}@${character.realm.slug}`);
            
            const activityData = await this.apiService.getCharacterActivityData(
              character.realm.slug,
              character.name,
              token.access_token
            );
            
            // Analyze weekly activities
            const weeklyActivities = ActivityTrackingService.analyzeWeeklyActivities(
              character.id,
              activityData
            );
            
            console.log(`✅ Found ${weeklyActivities.filter(a => a.completed).length}/${weeklyActivities.length} completed activities for ${character.name}`);
            
            // Store activity data in character object (we'll save this to database later)
            (character as any).weeklyActivities = weeklyActivities;
          } catch (error) {
            console.error(`❌ Failed to fetch activities for ${character.name}:`, error);
            // Continue with other characters even if one fails
          }
        }
        
        // Create user profile
        const userProfile: UserProfile = {
          id: `user_${Date.now()}`,
          battleTag: 'Unknown', // We'll need to get this from the API
          characters,
          accessToken: token,
          lastLogin: new Date()
        };

        // Save to database
        console.log('Saving user profile:', userProfile.id, 'with', userProfile.characters.length, 'characters');
        await this.databaseService.saveUserProfile(userProfile);

        // Generate JWT token
        const jwtToken = this.jwtService.generateToken(userProfile);

        // Redirect to frontend with token
        return res.redirect(`${this.config.app.frontendUrl}/?token=${jwtToken}`);
      } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({ error: 'Authentication failed' });
      }
    });

    // Character routes
    this.app.get('/api/characters', this.authenticateToken.bind(this), async (req, res) => {
      try {
        const userId = (req as any).user.userId;
        const userProfile = await this.databaseService.getUserProfile(userId);
        
        if (!userProfile) {
          return res.status(404).json({ error: 'User not found' });
        }

        return res.json({ characters: userProfile.characters });
      } catch (error) {
        console.error('Error fetching characters:', error);
        return res.status(500).json({ error: 'Failed to fetch characters' });
      }
    });

    this.app.get('/api/characters/:characterId/progress', this.authenticateToken.bind(this), async (req, res) => {
      try {
        const characterId = parseInt(req.params.characterId);
        const progress = await this.databaseService.getCharacterProgress(characterId);
        
        if (!progress) {
          return res.status(404).json({ error: 'Character progress not found' });
        }

        return res.json({ progress });
      } catch (error) {
        console.error('Error fetching character progress:', error);
        return res.status(500).json({ error: 'Failed to fetch character progress' });
      }
    });

    // Error handling middleware
    this.app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Unhandled error:', error);
      res.status(500).json({ error: 'Internal server error' });
    });

    // Weekly reset endpoints
    this.app.get('/api/reset/status', (req, res) => {
      try {
        const status = this.weeklyResetService.getResetStatus();
        return res.json(status);
      } catch (error) {
        console.error('Error getting reset status:', error);
        return res.status(500).json({ error: 'Failed to get reset status' });
      }
    });

    this.app.post('/api/reset/manual', this.authenticateToken.bind(this), async (req, res) => {
      try {
        console.log('🔄 Manual weekly reset triggered by user');
        await this.weeklyResetService.performWeeklyReset();
        return res.json({ message: 'Weekly reset completed successfully' });
      } catch (error) {
        console.error('Error performing manual reset:', error);
        return res.status(500).json({ error: 'Failed to perform weekly reset' });
      }
    });

    // Auto-refresh endpoints
    this.app.get('/api/refresh/status', (req, res) => {
      try {
        const stats = this.autoRefreshService.getStats();
        return res.json(stats);
      } catch (error) {
        console.error('Error getting refresh status:', error);
        return res.status(500).json({ error: 'Failed to get refresh status' });
      }
    });

    this.app.post('/api/refresh/manual', this.authenticateToken.bind(this), async (req, res) => {
      try {
        console.log('🔄 Manual refresh triggered by user');
        const stats = await this.autoRefreshService.performManualRefresh();
        return res.json({ message: 'Manual refresh completed successfully', stats });
      } catch (error) {
        console.error('Error performing manual refresh:', error);
        return res.status(500).json({ error: 'Failed to perform manual refresh' });
      }
    });

    this.app.post('/api/refresh/force', this.authenticateToken.bind(this), async (req, res) => {
      try {
        console.log('🔄 Force refresh triggered by user');
        await this.autoRefreshService.forceRefresh();
        return res.json({ message: 'Force refresh completed successfully' });
      } catch (error) {
        console.error('Error performing force refresh:', error);
        return res.status(500).json({ error: 'Failed to perform force refresh' });
      }
    });

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({ error: 'Not found' });
    });
  }

  private authenticateToken(req: express.Request, res: express.Response, next: express.NextFunction): void {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    try {
      const decoded = this.jwtService.verifyToken(token);
      (req as any).user = decoded;
      next();
    } catch (error) {
      res.status(403).json({ error: 'Invalid or expired token' });
      return;
    }
  }

  public start(): void {
    const port = this.config.app.port;
    this.app.listen(port, () => {
      console.log(`🚀 WoW Weekly Tracker server running on port ${port}`);
      console.log(`📊 Environment: ${this.config.app.nodeEnv}`);
      console.log(`🔗 Frontend URL: ${this.config.app.frontendUrl}`);
      
      // Start enhanced auto-refresh system
      this.autoRefreshService.start();
      
      // Start weekly reset scheduler
      this.weeklyResetService.startWeeklyResetScheduler();
    });
  }
}

// Start the server
const server = new WoWWeeklyTrackerServer();
server.start();
