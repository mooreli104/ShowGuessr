import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { config } from './config';
import { SocketController } from './controllers/SocketController';

const app = express();
const httpServer = createServer(app);

// Socket.IO setup with CORS
const io = new Server(httpServer, {
  cors: {
    origin: config.corsOrigin,
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API endpoints
app.get('/api/lobbies', (req, res) => {
  // TODO: Implement lobby listing
  res.json({ lobbies: [] });
});

// Initialize socket controller
const socketController = new SocketController(io);
socketController.initialize();

// Start server
httpServer.listen(config.port, () => {
  console.log(`
  ┌─────────────────────────────────────┐
  │  ShowGuessr Server Running          │
  │  Port: ${config.port}                      │
  │  Environment: ${config.nodeEnv}        │
  └─────────────────────────────────────┘
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
