# ShowGuessr

A real-time multiplayer show guessing game where players compete to identify TV shows, movies, anime, and cartoons from images. Built with modern web technologies and real-time WebSocket communication.

## Features

- **Multiplayer Lobbies**: Create or join game lobbies with customizable settings
- **Multiple Show Types**: Support for Anime, Movies, Cartoons, and TV Series
- **Real-time Gameplay**: Instant score updates and synchronized rounds using Socket.IO
- **Cross-Platform**: Web and mobile (React Native/Expo) support
- **Customizable Settings**: Adjust player count, round duration, and total rounds
- **Live Leaderboard**: See scores update in real-time as players answer

## Tech Stack

### Backend
- **Node.js** + **Express**: Server framework
- **Socket.IO**: Real-time WebSocket communication
- **TypeScript**: Type-safe development
- **Axios**: HTTP client for API requests

### Web Client
- **React 18**: UI framework
- **Vite**: Fast build tool
- **Socket.IO Client**: Real-time communication
- **Zustand**: State management
- **React Router**: Navigation

### Mobile App
- **React Native**: Mobile framework
- **Expo**: Development platform
- **React Navigation**: Mobile navigation
- **Zustand**: State management

### Shared
- **TypeScript**: Shared types across all packages

## Project Structure

```
ShowGuessr/
├── packages/
│   ├── server/          # Backend server
│   │   ├── src/
│   │   │   ├── config/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── web/             # Web client
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── pages/
│   │   │   ├── services/
│   │   │   ├── stores/
│   │   │   └── App.tsx
│   │   └── package.json
│   │
│   ├── mobile/          # Mobile app
│   │   ├── src/
│   │   │   ├── screens/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── stores/
│   │   ├── App.tsx
│   │   └── package.json
│   │
│   └── shared/          # Shared types and utilities
│       ├── src/
│       │   └── types.ts
│       └── package.json
│
└── package.json         # Root workspace config
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- API keys for content providers:
  - [TMDB API Key](https://www.themoviedb.org/settings/api) for movies and TV shows
  - AniList (no key needed, uses GraphQL endpoint)

### Installation

1. Clone the repository:
```bash
cd ShowGuessr
```

2. Install dependencies:
```bash
npm install
npm run install:all
```

3. Configure environment variables:

**Server** (`packages/server/.env`):
```env
PORT=3001
NODE_ENV=development
TMDB_API_KEY=your_tmdb_api_key_here
CORS_ORIGIN=http://localhost:5173
```

**Web** (`packages/web/.env`):
```env
VITE_SERVER_URL=http://localhost:3001
```

**Mobile**: Update `packages/mobile/src/services/socket.ts`:
```typescript
// Replace localhost with your local IP address for mobile testing
const SERVER_URL = 'http://192.168.1.x:3001';
```

### Running the Application

#### Development Mode

**Start the server:**
```bash
npm run dev:server
```

**Start the web client:**
```bash
npm run dev:web
```

**Start the mobile app:**
```bash
npm run dev:mobile
```

Or run all in separate terminals.

#### Production Build

```bash
npm run build:server
npm run build:web
```

## How to Play

1. **Create or Join a Lobby**
   - Enter your username
   - Create a new lobby with custom settings, or join an existing one with a lobby ID

2. **Customize Game Settings** (Host only)
   - Choose show type (Anime, Movie, Cartoon, TV Series)
   - Set max players (2-20)
   - Set round duration (10-120 seconds)
   - Set total rounds (1-50)

3. **Start the Game**
   - Host starts the game when ready (minimum 2 players)
   - An image from a show will be displayed

4. **Guess the Show**
   - Type the name of the show
   - Submit your answer before time runs out
   - Faster correct answers earn more points

5. **Win the Game**
   - Player with the highest score after all rounds wins
   - View final leaderboard at the end

## API Integration

### TMDB (The Movie Database)
Used for movies, TV series, and cartoons (animated TV shows).

**Get an API key:**
1. Create account at [TMDB](https://www.themoviedb.org/)
2. Go to Settings > API
3. Request an API key
4. Add to `.env` file

### AniList
Used for anime content. No API key required - uses public GraphQL endpoint.

**Endpoint:** `https://graphql.anilist.co`

## Development

### Building Shared Package

When you modify types in the `shared` package:

```bash
cd packages/shared
npm run build
```

### Adding New Features

1. Update types in `packages/shared/src/types.ts`
2. Build shared package
3. Implement backend logic in `packages/server/src/services/`
4. Add socket events in `packages/server/src/controllers/SocketController.ts`
5. Update frontend hooks and components

### Code Structure

- **Monorepo**: Uses npm workspaces for package management
- **Type Safety**: TypeScript across all packages
- **Shared Types**: Common interfaces in `@showguessr/shared`
- **Real-time**: Socket.IO for bidirectional communication

## Socket Events

### Client → Server
- `create_lobby`: Create a new lobby
- `join_lobby`: Join an existing lobby
- `leave_lobby`: Leave current lobby
- `update_settings`: Update lobby settings (host only)
- `start_game`: Start the game (host only)
- `submit_answer`: Submit an answer for current round

### Server → Client
- `lobby_created`: Lobby created/joined successfully
- `lobby_updated`: Lobby settings changed
- `player_joined`: New player joined
- `player_left`: Player left the lobby
- `game_started`: Game has started
- `new_round`: New round started with image
- `answer_result`: Answer submission result
- `round_end`: Round ended with correct answer
- `game_end`: Game finished with final results
- `error`: Error message

## Future Enhancements

- [ ] User authentication and profiles
- [ ] Game statistics and history
- [ ] More difficulty levels (popularity-based)
- [ ] Hint system
- [ ] Power-ups and bonuses
- [ ] Tournament mode
- [ ] Custom image uploads
- [ ] Chat system
- [ ] Sound effects and music
- [ ] Achievements and badges

## Troubleshooting

### Mobile app can't connect to server
- Make sure server is running
- Use your local IP address instead of localhost in `packages/mobile/src/services/socket.ts`
- Check firewall settings

### API images not loading
- Verify API keys are correct in `.env`
- Check API rate limits
- Ensure proper CORS configuration

### Build errors
```bash
# Clean install
rm -rf node_modules package-lock.json
rm -rf packages/*/node_modules packages/*/package-lock.json
npm install
npm run install:all
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
