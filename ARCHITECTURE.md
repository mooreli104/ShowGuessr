# ShowGuessr Architecture

## System Overview

```
┌─────────────────┐         ┌─────────────────┐
│   Web Client    │◄────────┤  Mobile Client  │
│   (React +      │         │  (React Native  │
│    Vite)        │         │   + Expo)       │
└────────┬────────┘         └────────┬────────┘
         │                           │
         │    WebSocket (Socket.IO)  │
         │                           │
         └───────────┬───────────────┘
                     │
         ┌───────────▼────────────┐
         │   Backend Server       │
         │   (Node.js + Express   │
         │    + Socket.IO)        │
         └───────────┬────────────┘
                     │
         ┌───────────▼────────────┐
         │   External APIs        │
         │   - TMDB (Movies/TV)   │
         │   - AniList (Anime)    │
         └────────────────────────┘
```

## Component Architecture

### Backend Server

```
packages/server/
├── src/
│   ├── config/
│   │   └── index.ts              # Environment configuration
│   │
│   ├── controllers/
│   │   └── SocketController.ts   # WebSocket event handlers
│   │
│   ├── services/
│   │   ├── ContentService.ts     # Fetch show data from APIs
│   │   └── LobbyManager.ts       # Manage game lobbies & state
│   │
│   └── index.ts                  # Server entry point
```

**Key Responsibilities:**
- Real-time WebSocket communication
- Lobby management (create, join, leave)
- Game state management (rounds, scoring)
- Content fetching from external APIs
- Answer validation

### Web Client

```
packages/web/
├── src/
│   ├── services/
│   │   └── socket.ts             # Socket.IO client wrapper
│   │
│   ├── stores/
│   │   └── gameStore.ts          # Zustand global state
│   │
│   ├── hooks/
│   │   └── useSocket.ts          # Socket event hooks
│   │
│   ├── pages/
│   │   ├── Home.tsx              # Lobby creation/join
│   │   ├── Lobby.tsx             # Waiting room
│   │   └── Game.tsx              # Active gameplay
│   │
│   └── App.tsx                   # Router setup
```

**Key Responsibilities:**
- User interface
- Socket event handling
- State management
- Navigation between screens

### Mobile App

```
packages/mobile/
├── src/
│   ├── services/
│   │   └── socket.ts             # Socket.IO client
│   │
│   ├── stores/
│   │   └── gameStore.ts          # Zustand state
│   │
│   ├── hooks/
│   │   └── useSocket.ts          # Socket hooks
│   │
│   └── screens/
│       ├── HomeScreen.tsx        # Lobby creation/join
│       ├── LobbyScreen.tsx       # Waiting room
│       └── GameScreen.tsx        # Gameplay
│
└── App.tsx                       # Navigation setup
```

**Key Responsibilities:**
- Mobile-optimized UI
- Native navigation
- Same business logic as web

### Shared Package

```
packages/shared/
└── src/
    └── types.ts                  # TypeScript types & enums
```

**Key Responsibilities:**
- Common TypeScript interfaces
- Socket event definitions
- Shared business logic types

## Data Flow

### 1. Creating a Lobby

```
User (Web/Mobile)
    │
    ├─► Enter username, lobby name, settings
    │
    └─► Click "Create Lobby"
         │
         ▼
    Socket.emit('create_lobby', payload)
         │
         ▼
    Server: SocketController.handleCreateLobby()
         │
         ├─► LobbyManager.createLobby()
         │       │
         │       ├─► Generate lobby ID
         │       ├─► Create Player object
         │       └─► Store lobby in Map
         │
         └─► Socket.emit('lobby_created', { lobby, playerId })
                 │
                 ▼
    Client: useSocket hook receives event
         │
         ├─► gameStore.setPlayerId()
         ├─► gameStore.setCurrentLobby()
         │
         └─► Navigate to Lobby screen
```

### 2. Starting a Game

```
Host clicks "Start Game"
    │
    ▼
Socket.emit('start_game')
    │
    ▼
Server: LobbyManager.startGame()
    │
    ├─► Validate host permissions
    ├─► Set lobby status to 'playing'
    ├─► Reset player scores
    │
    └─► LobbyManager.startNewRound()
            │
            ├─► ContentService.getRandomShow()
            │       │
            │       └─► Fetch from TMDB/AniList API
            │
            └─► Create GameRound object
                    │
                    ▼
Socket.broadcast('game_started', { lobby })
Socket.broadcast('new_round', { roundNumber, imageUrl, duration })
    │
    ▼
All Clients receive events
    │
    ├─► gameStore.setCurrentRound()
    ├─► gameStore.setImageUrl()
    │
    └─► Navigate to Game screen
```

### 3. Submitting an Answer

```
User types answer and clicks "Submit"
    │
    ▼
Socket.emit('submit_answer', { lobbyId, answer })
    │
    ▼
Server: LobbyManager.submitAnswer()
    │
    ├─► ContentService.checkAnswer()
    │       │
    │       └─► Normalize and compare strings
    │
    ├─► Calculate points (based on speed)
    │
    └─► Update player score
            │
            ▼
Socket.broadcast('answer_result', {
    playerId,
    username,
    correct,
    points,
    timeToAnswer
})
    │
    ▼
All Clients show answer result notification
```

### 4. Round End

```
Round timer expires (server-side)
    │
    ▼
SocketController.endRound()
    │
    ├─► LobbyManager.endRound()
    │       │
    │       ├─► Check if game is finished
    │       └─► Increment round counter
    │
    └─► Socket.broadcast('round_end', {
            correctAnswer,
            leaderboard
        })
            │
            ▼
    Clients display correct answer & leaderboard
            │
            ▼
    Wait 5 seconds...
            │
            ▼
    Start next round OR end game
```

## State Management

### Server State

**LobbyManager maintains:**
- `Map<lobbyId, Lobby>`: All active lobbies
- `Map<playerId, lobbyId>`: Player-to-lobby mapping
- `Map<lobbyId, GameRound>`: Current round for each lobby

**In-memory only** (resets on server restart)

### Client State (Zustand)

```typescript
{
  // User identity
  playerId: string | null
  username: string | null

  // Lobby data
  currentLobby: Lobby | null

  // Game state
  currentRound: number
  imageUrl: string | null
  roundDuration: number
  totalRounds: number
  leaderboard: Player[]

  // Connection
  isConnected: boolean
  error: string | null
}
```

## Socket Events Flow

### Connection Events
- `connect` → Client connected to server
- `disconnect` → Client disconnected

### Lobby Events
- `create_lobby` → Request to create lobby
- `join_lobby` → Request to join lobby
- `leave_lobby` → Request to leave lobby
- `update_settings` → Update lobby settings (host only)

### Lobby Broadcasts
- `lobby_created` → Lobby successfully created/joined
- `lobby_updated` → Settings changed
- `player_joined` → New player joined
- `player_left` → Player left

### Game Events
- `start_game` → Start game (host only)
- `submit_answer` → Submit answer for current round

### Game Broadcasts
- `game_started` → Game has begun
- `new_round` → New round started
- `answer_result` → Answer submission result
- `round_end` → Round finished
- `game_end` → Game finished

### Error Events
- `error` → Error occurred

## API Integration

### TMDB (The Movie Database)

**Endpoints Used:**
- `/movie/popular` - Popular movies
- `/tv/popular` - Popular TV series
- `/discover/tv?with_genres=16` - Animated TV shows (cartoons)

**Rate Limits:** 40 requests per 10 seconds

### AniList

**Endpoint:**
- GraphQL: `https://graphql.anilist.co`

**Query:**
```graphql
query ($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    media(type: ANIME, sort: POPULARITY_DESC) {
      id
      title { romaji, english, native }
      coverImage { large }
      startDate { year }
    }
  }
}
```

**Rate Limits:** No strict limits for public queries

## Scalability Considerations

### Current Limitations
- In-memory state (single server instance)
- No persistence (lobbies lost on restart)
- No authentication

### Future Improvements
- **Redis**: Store lobby state for multi-server support
- **Database**: Persist game history, user profiles
- **Load Balancer**: Distribute Socket.IO connections
- **Sticky Sessions**: Ensure WebSocket connections stay on same server
- **Message Queue**: Handle async operations
- **CDN**: Serve static assets and images

## Security Considerations

### Current Implementation
- CORS configured for specific origins
- Input validation on server
- No direct database queries (no SQL injection risk)

### Recommended Additions
- Rate limiting on socket events
- Authentication & authorization
- Encrypted WebSocket connections (WSS)
- Input sanitization
- API key rotation
- DDoS protection

## Performance Optimization

### Current Optimizations
- Vite for fast development builds
- Code splitting in React
- Efficient state updates with Zustand
- WebSocket for low-latency communication

### Potential Improvements
- Image CDN/caching
- Lazy loading components
- Server-side caching of API responses
- Compression middleware
- Minimize bundle size
- Progressive Web App (PWA) for web client

## Deployment Architecture

```
┌─────────────────────────────────────────────┐
│            Production Setup                 │
│                                             │
│  ┌──────────┐      ┌──────────────┐        │
│  │   CDN    │      │  Web Hosting │        │
│  │ (Static) │      │   (Vercel/   │        │
│  └────┬─────┘      │   Netlify)   │        │
│       │            └──────┬───────┘        │
│       │                   │                 │
│       │            ┌──────▼───────┐        │
│       └────────────┤ Load Balancer├────────┤
│                    └──────┬───────┘        │
│                           │                 │
│         ┌─────────────────┼─────────────┐  │
│         │                 │             │  │
│    ┌────▼─────┐    ┌─────▼────┐  ┌────▼───┐
│    │  Server  │    │  Server  │  │ Server │
│    │ Instance │    │ Instance │  │Instance│
│    └────┬─────┘    └─────┬────┘  └────┬───┘
│         │                │             │  │
│         └────────────────┼─────────────┘  │
│                          │                 │
│                   ┌──────▼───────┐        │
│                   │    Redis     │        │
│                   │  (Sessions)  │        │
│                   └──────────────┘        │
└─────────────────────────────────────────────┘
```

## Technology Choices Rationale

### Why Socket.IO?
- Automatic reconnection
- Fallback to HTTP long-polling
- Room-based broadcasting
- Built-in error handling

### Why Zustand?
- Lightweight (1KB)
- Simple API
- No boilerplate
- React hooks integration

### Why Vite?
- Fast HMR (Hot Module Replacement)
- Modern build tool
- Optimized production builds
- Great TypeScript support

### Why React Native + Expo?
- Cross-platform (iOS + Android)
- Shared codebase with web
- Easy development workflow
- OTA updates support

### Why TypeScript?
- Type safety across stack
- Better IDE support
- Catch errors at compile time
- Self-documenting code
