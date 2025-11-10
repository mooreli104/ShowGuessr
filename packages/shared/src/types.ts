// Show types that can be guessed
export enum ShowType {
  ANIME = 'anime',
  MOVIE = 'movie',
  CARTOON = 'cartoon',
  TV_SERIES = 'tv_series'
}

// Lobby settings
export interface LobbySettings {
  maxPlayers: number;
  roundDuration: number; // seconds
  totalRounds: number;
  showType: ShowType;
}

// Player information
export interface Player {
  id: string;
  username: string;
  score: number;
  isHost: boolean;
  avatar?: string;
}

// Lobby state
export interface Lobby {
  id: string;
  name: string;
  hostId: string;
  players: Player[];
  settings: LobbySettings;
  status: 'waiting' | 'playing' | 'finished';
  currentRound: number;
  createdAt: Date;
}

// Show/content information
export interface ShowContent {
  id: string;
  title: string;
  imageUrl: string;
  showType: ShowType;
  alternativeTitles?: string[];
  year?: number;
}

// Game round state
export interface GameRound {
  roundNumber: number;
  showContent: ShowContent;
  startTime: Date;
  endTime: Date;
  correctAnswers: Map<string, number>; // playerId -> timestamp
}

// Socket events
export enum SocketEvent {
  // Connection
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',

  // Lobby management
  CREATE_LOBBY = 'create_lobby',
  JOIN_LOBBY = 'join_lobby',
  LEAVE_LOBBY = 'leave_lobby',
  UPDATE_SETTINGS = 'update_settings',
  START_GAME = 'start_game',
  SKIP_ROUND = 'skip_round',

  // Lobby updates
  LOBBY_CREATED = 'lobby_created',
  LOBBY_UPDATED = 'lobby_updated',
  PLAYER_JOINED = 'player_joined',
  PLAYER_LEFT = 'player_left',

  // Game events
  GAME_STARTED = 'game_started',
  NEW_ROUND = 'new_round',
  SUBMIT_ANSWER = 'submit_answer',
  ANSWER_RESULT = 'answer_result',
  ROUND_END = 'round_end',
  GAME_END = 'game_end',

  // Errors
  ERROR = 'error'
}

// Socket payload types
export interface CreateLobbyPayload {
  lobbyName: string;
  username: string;
  settings: LobbySettings;
}

export interface JoinLobbyPayload {
  lobbyId: string;
  username: string;
}

export interface SubmitAnswerPayload {
  lobbyId: string;
  answer: string;
}

export interface AnswerResultPayload {
  playerId: string;
  username: string;
  correct: boolean;
  points: number;
  timeToAnswer?: number;
}

export interface RoundEndPayload {
  correctAnswer: string;
  leaderboard: Player[];
  nextRoundIn?: number;
}

export interface GameEndPayload {
  finalLeaderboard: Player[];
  winner: Player;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface LobbyListResponse {
  lobbies: Lobby[];
}
