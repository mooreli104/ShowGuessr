# Contributing to ShowGuessr

Thank you for your interest in contributing to ShowGuessr! This document provides guidelines and instructions for contributing.

## Development Setup

See [SETUP.md](./SETUP.md) for detailed setup instructions.

## Code Structure

- `packages/server`: Backend server (Node.js + Express + Socket.IO)
- `packages/web`: Web client (React + Vite)
- `packages/mobile`: Mobile app (React Native + Expo)
- `packages/shared`: Shared TypeScript types

## Making Changes

### 1. Shared Types

If you're adding new features that require new types:

1. Edit `packages/shared/src/types.ts`
2. Rebuild the shared package:
   ```bash
   cd packages/shared
   npm run build
   cd ../..
   ```

### 2. Backend Changes

For server-side logic:

1. **Services** (`packages/server/src/services/`):
   - `ContentService.ts`: API integration for fetching shows
   - `LobbyManager.ts`: Game logic and state management

2. **Controllers** (`packages/server/src/controllers/`):
   - `SocketController.ts`: WebSocket event handlers

3. Test your changes:
   ```bash
   npm run dev:server
   ```

### 3. Frontend Changes

For web client:

1. **Pages** (`packages/web/src/pages/`):
   - `Home.tsx`: Lobby creation/join UI
   - `Lobby.tsx`: Waiting room UI
   - `Game.tsx`: Gameplay UI

2. **Hooks** (`packages/web/src/hooks/`):
   - `useSocket.ts`: Socket event handling

3. **State** (`packages/web/src/stores/`):
   - `gameStore.ts`: Global state management

4. Test your changes:
   ```bash
   npm run dev:web
   ```

### 4. Mobile Changes

Similar structure to web, but in `packages/mobile/src/screens/`.

Test with:
```bash
npm run dev:mobile
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define interfaces for all data structures
- Avoid `any` type - use proper types
- Use meaningful variable names

### React/React Native

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use proper prop types

### Socket.IO

- Define all events in `shared/src/types.ts`
- Use enum for event names
- Handle errors gracefully
- Always clean up listeners in useEffect

### Naming Conventions

- **Files**: PascalCase for components, camelCase for utilities
- **Components**: PascalCase
- **Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Types/Interfaces**: PascalCase

## Adding New Features

### Example: Adding a New Show Type

1. **Add type to shared package**:
   ```typescript
   // packages/shared/src/types.ts
   export enum ShowType {
     ANIME = 'anime',
     MOVIE = 'movie',
     CARTOON = 'cartoon',
     TV_SERIES = 'tv_series',
     DOCUMENTARY = 'documentary', // NEW
   }
   ```

2. **Implement API integration**:
   ```typescript
   // packages/server/src/services/ContentService.ts
   private async getRandomDocumentary(difficulty: string): Promise<ShowContent> {
     // Implementation
   }
   ```

3. **Update the switch statement**:
   ```typescript
   async getRandomShow(showType: ShowType, difficulty: string): Promise<ShowContent> {
     switch (showType) {
       // ... existing cases
       case ShowType.DOCUMENTARY:
         return this.getRandomDocumentary(difficulty);
     }
   }
   ```

4. **Update UI**:
   ```tsx
   // packages/web/src/pages/Home.tsx
   <option value={ShowType.DOCUMENTARY}>Documentary</option>
   ```

5. **Build and test**:
   ```bash
   cd packages/shared && npm run build && cd ../..
   npm run dev:server
   npm run dev:web
   ```

### Example: Adding a New Socket Event

1. **Define event in shared types**:
   ```typescript
   // packages/shared/src/types.ts
   export enum SocketEvent {
     // ... existing events
     PLAYER_READY = 'player_ready',
   }

   export interface PlayerReadyPayload {
     playerId: string;
     ready: boolean;
   }
   ```

2. **Add server handler**:
   ```typescript
   // packages/server/src/controllers/SocketController.ts
   private handlePlayerReady(socket: Socket) {
     socket.on(SocketEvent.PLAYER_READY, (payload: PlayerReadyPayload) => {
       // Handle logic
       socket.to(lobbyId).emit(SocketEvent.PLAYER_READY, payload);
     });
   }
   ```

3. **Add client hook**:
   ```typescript
   // packages/web/src/hooks/useSocket.ts
   const setPlayerReady = (ready: boolean) => {
     const socket = socketService.getSocket();
     if (!socket) return;

     socket.emit(SocketEvent.PLAYER_READY, {
       playerId: useGameStore.getState().playerId,
       ready,
     });
   };

   return {
     // ... existing methods
     setPlayerReady,
   };
   ```

4. **Use in component**:
   ```tsx
   // packages/web/src/pages/Lobby.tsx
   const { setPlayerReady } = useSocket();

   <button onClick={() => setPlayerReady(true)}>
     Ready!
   </button>
   ```

## Testing

### Manual Testing Checklist

- [ ] Create a lobby
- [ ] Join a lobby
- [ ] Leave a lobby
- [ ] Start a game
- [ ] Submit correct answer
- [ ] Submit incorrect answer
- [ ] Complete a full game
- [ ] Test with multiple players
- [ ] Test disconnection/reconnection
- [ ] Test on mobile

### Future: Automated Testing

We welcome contributions to add:
- Unit tests (Jest)
- Integration tests (Supertest)
- E2E tests (Playwright/Cypress)

## Documentation

When adding features, update:

- README.md - If it affects setup or usage
- ARCHITECTURE.md - If it changes system design
- Code comments - For complex logic

## Commit Messages

Use clear, descriptive commit messages:

```
feat: add documentary show type
fix: correct answer validation for special characters
docs: update setup instructions
refactor: simplify lobby management logic
```

Prefixes:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

## Pull Request Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Make your changes
4. Test thoroughly
5. Commit with clear messages
6. Push to your fork
7. Open a Pull Request

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows project style
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

## Need Help?

- Check [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- Check [SETUP.md](./SETUP.md) for setup issues
- Open an issue for bugs or feature requests
- Start a discussion for questions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
