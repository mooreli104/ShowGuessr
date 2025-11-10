# Quick Setup Guide

## Initial Setup

### 1. Install Dependencies

```bash
npm install
```

This will install dependencies for all packages in the monorepo.

### 2. Get API Keys

#### TMDB API Key (Required for Movies, TV Shows, Cartoons)

1. Go to [https://www.themoviedb.org/signup](https://www.themoviedb.org/signup)
2. Create an account
3. Go to Settings → API
4. Click "Request an API Key"
5. Fill out the form (choose "Developer" option)
6. Copy your API key

#### AniList (No key needed)
The anime API uses AniList's public GraphQL endpoint, so no authentication is required.

### 3. Configure Environment Variables

#### Server Configuration

Create `packages/server/.env`:

```bash
cp packages/server/.env.example packages/server/.env
```

Edit the file and add your TMDB API key:

```env
PORT=3001
NODE_ENV=development
TMDB_API_KEY=your_actual_api_key_here
CORS_ORIGIN=http://localhost:5173
```

#### Web Client Configuration

Create `packages/web/.env`:

```bash
cp packages/web/.env.example packages/web/.env
```

The default configuration should work:

```env
VITE_SERVER_URL=http://localhost:3001
```

#### Mobile App Configuration

For mobile development, you need to use your computer's local IP address instead of localhost.

1. Find your local IP:
   - **Windows**: `ipconfig` (look for IPv4 Address)
   - **Mac/Linux**: `ifconfig` or `ip addr` (look for inet)

2. Edit `packages/mobile/src/services/socket.ts`:

```typescript
// Replace this line:
const SERVER_URL = 'http://localhost:3001';

// With your local IP:
const SERVER_URL = 'http://192.168.1.x:3001';
```

### 4. Build Shared Package

```bash
cd packages/shared
npm run build
cd ../..
```

## Running the Application

### Terminal 1: Start the Server

```bash
npm run dev:server
```

You should see:
```
┌─────────────────────────────────────┐
│  ShowGuessr Server Running          │
│  Port: 3001                          │
│  Environment: development            │
└─────────────────────────────────────┘
```

### Terminal 2: Start the Web Client

```bash
npm run dev:web
```

The web app will be available at [http://localhost:5173](http://localhost:5173)

### Terminal 3 (Optional): Start Mobile App

```bash
npm run dev:mobile
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone

## Testing the Setup

1. Open the web client at [http://localhost:5173](http://localhost:5173)
2. Enter a username
3. Create a lobby with a name
4. Choose settings (e.g., Anime, 2-4 players, 30s rounds)
5. Click "Create Lobby"
6. Open another browser window/tab
7. Enter a different username
8. Copy the Lobby ID from the first window
9. Join the lobby
10. The host can now start the game!

## Common Issues

### "Failed to fetch anime/movie content"
- Check that your TMDB API key is correct in `.env`
- Verify the API key is active on TMDB website
- Check your internet connection

### Web client can't connect to server
- Ensure the server is running on port 3001
- Check that CORS_ORIGIN matches your web client URL
- Look for errors in server console

### Mobile app can't connect
- Use your local IP address, not localhost
- Make sure your phone and computer are on the same network
- Check firewall settings

### Build errors
```bash
# Clean everything and reinstall
rm -rf node_modules
rm -rf packages/*/node_modules
npm install
```

## Development Workflow

### Making Changes to Shared Types

1. Edit `packages/shared/src/types.ts`
2. Rebuild shared package:
   ```bash
   cd packages/shared
   npm run build
   ```
3. Restart server and web client to pick up changes

### Adding New Features

1. Update types in `shared` package
2. Implement backend logic in `server/src/services/`
3. Add socket event handlers in `server/src/controllers/SocketController.ts`
4. Update frontend hooks in `web/src/hooks/useSocket.ts`
5. Update UI components in `web/src/pages/` or `mobile/src/screens/`

## Next Steps

- Customize the game settings
- Add more show types
- Implement additional features
- Style the UI to match your preferences
- Deploy to production

Enjoy building ShowGuessr!
