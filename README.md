# WoW Weekly Activity Tracker

A desktop application to track World of Warcraft character weekly activities using the Blizzard Battle.net API.

## Features

- 🔐 **Automatic OAuth Authentication** - Seamless login with Battle.net
- 📊 **Weekly Activity Tracking** - Monitor dungeons, raids, quests, and more
- 🔄 **Auto-refresh** - Keep data up-to-date automatically
- 👥 **Multi-character Support** - Track all your characters across realms
- 📱 **Modern UI** - Clean, responsive interface built with React
- 💾 **Local Storage** - SQLite database for offline data storage

## Tech Stack

- **Backend**: Node.js + TypeScript + Express
- **Frontend**: React + TypeScript + Vite
- **Desktop**: Electron
- **Database**: SQLite
- **Authentication**: OAuth 2.0 with Battle.net

## Getting Started

### Prerequisites

1. **Blizzard Developer Account**: Register at [develop.battle.net](https://develop.battle.net)
2. **Node.js**: Version 18 or higher
3. **npm**: Comes with Node.js

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   cd src/frontend && npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your Blizzard API credentials

4. Run in development mode:
   ```bash
   npm run dev
   ```

### Building for Production

```bash
npm run build
npm run start
```

## API Setup

1. Go to [Blizzard Developer Portal](https://develop.battle.net)
2. Create a new application
3. Note your `CLIENT_ID` and `CLIENT_SECRET`
4. Add these to your `.env` file

## Project Structure

```
src/
├── backend/           # Express server and API logic
│   ├── auth/         # OAuth authentication
│   ├── api/          # Blizzard API integration
│   ├── database/     # SQLite database models
│   └── services/     # Business logic
├── frontend/         # React application
│   ├── components/  # UI components
│   ├── pages/       # Application pages
│   ├── hooks/       # Custom React hooks
│   └── utils/       # Frontend utilities
├── shared/          # Shared types and utilities
└── electron/        # Electron main process
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
