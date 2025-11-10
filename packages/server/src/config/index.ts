import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  tmdbApiKey: process.env.TMDB_API_KEY || '',
  anilistClientId: process.env.ANILIST_CLIENT_ID || '',
  anilistClientSecret: process.env.ANILIST_CLIENT_SECRET || '',
};
