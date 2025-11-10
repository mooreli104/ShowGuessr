# ShowGuessr - Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- npm installed
- TMDB API key (free, takes 2 minutes to get)

## Step 1: Get Your API Key (2 minutes)

1. Go to [https://www.themoviedb.org/signup](https://www.themoviedb.org/signup)
2. Create a free account
3. Go to Settings → API → Request an API Key
4. Choose "Developer" option
5. Fill out the form (any reasonable answers work)
6. Copy your API key

## Step 2: Install Dependencies (2 minutes)

```bash
cd ShowGuessr
npm install
```

This will install all dependencies for all packages.

## Step 3: Configure Server (1 minute)

Create the server environment file:

```bash
cp packages/server/.env.example packages/server/.env
```

Edit `packages/server/.env` and add your TMDB API key:

```env
PORT=3001
NODE_ENV=development
TMDB_API_KEY=paste_your_api_key_here
CORS_ORIGIN=http://localhost:5173
```

## Step 4: Build Shared Package (30 seconds)

```bash
cd packages/shared
npm run build
cd ../..
```

## Step 5: Verify Setup (Optional)

```bash
npm run verify
```

This will check if everything is configured correctly.

## Step 6: Start the Application

Open 2 terminal windows:

**Terminal 1 - Backend:**
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

**Terminal 2 - Web Client:**
```bash
npm run dev:web
```

You should see:
```
  VITE v6.0.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## Step 7: Play!

1. Open [http://localhost:5173](http://localhost:5173) in your browser
2. Enter a username (e.g., "Player1")
3. Create a lobby:
   - Lobby name: "Test Game"
   - Show type: Anime (or your choice)
   - Keep default settings
   - Click "Create Lobby"
4. Copy the Lobby ID
5. Open a new browser tab/window
6. Enter a different username (e.g., "Player2")
7. Paste the Lobby ID and click "Join Lobby"
8. In the first tab (as host), click "Start Game"
9. Start guessing shows!

## Troubleshooting

### Server won't start
- Check that port 3001 is not in use
- Verify your .env file has the API key
- Make sure npm install completed successfully

### Web client shows connection error
- Ensure the server is running
- Check that the server is on port 3001
- Look at the server terminal for errors

### No images showing in game
- Verify your TMDB API key is correct
- Check your internet connection
- Look at browser console for errors

### "Failed to fetch content"
- Your API key might be invalid
- Check the server logs for detailed error messages
- Verify you have internet connection

## Mobile App (Optional)

To run the mobile app:

1. Install Expo Go on your phone:
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Update server URL in `packages/mobile/src/services/socket.ts`:
   ```typescript
   // Find your local IP address:
   // Windows: ipconfig
   // Mac/Linux: ifconfig or ip addr

   const SERVER_URL = 'http://YOUR_LOCAL_IP:3001';
   // Example: 'http://192.168.1.100:3001'
   ```

3. Start the mobile app:
   ```bash
   npm run dev:mobile
   ```

4. Scan the QR code with Expo Go

## What's Next?

Now that you have it running:

1. **Customize Settings**: Try different show types, round durations, etc.
2. **Read the Docs**:
   - [README.md](./README.md) for full documentation
   - [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
   - [CONTRIBUTING.md](./CONTRIBUTING.md) to add features
3. **Add Features**: Check out the future enhancements in README
4. **Deploy**: When ready, deploy to production

## Common npm Scripts

```bash
# Development
npm run dev:server         # Start backend
npm run dev:web           # Start web client
npm run dev:mobile        # Start mobile app

# Building
npm run build:server      # Build backend
npm run build:web         # Build web client
npm run build:shared      # Build shared types

# Utilities
npm run verify            # Verify setup
```

## Getting Help

- Check [SETUP.md](./SETUP.md) for detailed setup info
- Check [ARCHITECTURE.md](./ARCHITECTURE.md) for how things work
- Check console/terminal for error messages
- Check that all dependencies installed: `npm install`

## Success!

If you can create a lobby, join it, and play a game - congratulations! 🎉

You now have a fully functional multiplayer game skeleton ready to customize and extend.

---

**Need more help?** Check the other documentation files or open an issue on GitHub.
