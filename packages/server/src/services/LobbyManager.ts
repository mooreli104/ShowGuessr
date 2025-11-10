import { v4 as uuidv4 } from 'uuid';
import {
  Lobby,
  Player,
  LobbySettings,
  GameRound,
  ShowContent,
  ShowType
} from '@showguessr/shared';
import { ContentService } from './ContentService.js';

/**
 * Manages all game lobbies
 */
export class LobbyManager {
  private lobbies: Map<string, Lobby> = new Map();
  private playerLobbyMap: Map<string, string> = new Map(); // playerId -> lobbyId
  private contentService: ContentService;
  private activeRounds: Map<string, GameRound> = new Map(); // lobbyId -> current round

  constructor() {
    this.contentService = new ContentService();
  }

  /**
   * Create a new lobby
   */
  createLobby(hostUsername: string, lobbyName: string, settings: LobbySettings): { lobby: Lobby; player: Player } {
    const lobbyId = uuidv4();
    const playerId = uuidv4();

    const host: Player = {
      id: playerId,
      username: hostUsername,
      score: 0,
      isHost: true
    };

    const lobby: Lobby = {
      id: lobbyId,
      name: lobbyName,
      hostId: playerId,
      players: [host],
      settings,
      status: 'waiting',
      currentRound: 0,
      createdAt: new Date()
    };

    this.lobbies.set(lobbyId, lobby);
    this.playerLobbyMap.set(playerId, lobbyId);

    return { lobby, player: host };
  }

  /**
   * Join an existing lobby
   */
  joinLobby(lobbyId: string, username: string): { lobby: Lobby; player: Player } {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) {
      throw new Error('Lobby not found');
    }

    if (lobby.status !== 'waiting') {
      throw new Error('Game already in progress');
    }

    if (lobby.players.length >= lobby.settings.maxPlayers) {
      throw new Error('Lobby is full');
    }

    const playerId = uuidv4();
    const player: Player = {
      id: playerId,
      username,
      score: 0,
      isHost: false
    };

    lobby.players.push(player);
    this.playerLobbyMap.set(playerId, lobbyId);

    return { lobby, player };
  }

  /**
   * Leave a lobby
   */
  leaveLobby(playerId: string): { lobbyId: string; shouldDeleteLobby: boolean; newHost?: Player } {
    const lobbyId = this.playerLobbyMap.get(playerId);
    if (!lobbyId) {
      throw new Error('Player not in any lobby');
    }

    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) {
      throw new Error('Lobby not found');
    }

    lobby.players = lobby.players.filter(p => p.id !== playerId);
    this.playerLobbyMap.delete(playerId);

    let newHost: Player | undefined;

    // If no players left, delete lobby
    if (lobby.players.length === 0) {
      this.lobbies.delete(lobbyId);
      this.activeRounds.delete(lobbyId);
      return { lobbyId, shouldDeleteLobby: true };
    }

    // If host left, assign new host
    if (lobby.hostId === playerId && lobby.players.length > 0) {
      newHost = lobby.players[0];
      newHost.isHost = true;
      lobby.hostId = newHost.id;
    }

    return { lobbyId, shouldDeleteLobby: false, newHost };
  }

  /**
   * Update lobby settings (only host can do this)
   */
  updateSettings(playerId: string, settings: Partial<LobbySettings>): Lobby {
    const lobbyId = this.playerLobbyMap.get(playerId);
    if (!lobbyId) {
      throw new Error('Player not in any lobby');
    }

    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) {
      throw new Error('Lobby not found');
    }

    if (lobby.hostId !== playerId) {
      throw new Error('Only host can update settings');
    }

    lobby.settings = { ...lobby.settings, ...settings };
    return lobby;
  }

  /**
   * Start a game
   */
  async startGame(playerId: string): Promise<{ lobby: Lobby; round: GameRound }> {
    const lobbyId = this.playerLobbyMap.get(playerId);
    if (!lobbyId) {
      throw new Error('Player not in any lobby');
    }

    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) {
      throw new Error('Lobby not found');
    }

    if (lobby.hostId !== playerId) {
      throw new Error('Only host can start the game');
    }

    if (lobby.players.length < 2) {
      throw new Error('Need at least 2 players to start');
    }

    lobby.status = 'playing';
    lobby.currentRound = 1;

    // Reset all player scores
    lobby.players.forEach(p => p.score = 0);

    const round = await this.startNewRound(lobbyId);
    return { lobby, round };
  }

  /**
   * Start a new round
   */
  async startNewRound(lobbyId: string): Promise<GameRound> {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) {
      throw new Error('Lobby not found');
    }

    const showContent = await this.contentService.getRandomShow(
      lobby.settings.showType,
      lobby.settings.difficulty
    );

    const round: GameRound = {
      roundNumber: lobby.currentRound,
      showContent,
      startTime: new Date(),
      endTime: new Date(Date.now() + lobby.settings.roundDuration * 1000),
      correctAnswers: new Map()
    };

    this.activeRounds.set(lobbyId, round);
    return round;
  }

  /**
   * Submit an answer for the current round
   */
  submitAnswer(playerId: string, answer: string): { correct: boolean; points: number; timeToAnswer: number } {
    const lobbyId = this.playerLobbyMap.get(playerId);
    if (!lobbyId) {
      throw new Error('Player not in any lobby');
    }

    const lobby = this.lobbies.get(lobbyId);
    const round = this.activeRounds.get(lobbyId);

    if (!lobby || !round) {
      throw new Error('No active round');
    }

    const correct = this.contentService.checkAnswer(
      answer,
      round.showContent.title,
      round.showContent.alternativeTitles
    );

    const timeToAnswer = Date.now() - round.startTime.getTime();

    if (correct) {
      // Check if player already answered correctly (to prevent score inflation)
      if (round.correctAnswers.has(playerId)) {
        return { correct: true, points: 0, timeToAnswer };
      }

      // Points based on speed (faster = more points)
      const maxPoints = 1000;
      const timeRatio = Math.max(0, 1 - (timeToAnswer / (lobby.settings.roundDuration * 1000)));
      const points = Math.floor(maxPoints * timeRatio) + 100; // Minimum 100 points

      round.correctAnswers.set(playerId, Date.now());

      // Update player score
      const player = lobby.players.find(p => p.id === playerId);
      if (player) {
        player.score += points;
      }

      return { correct: true, points, timeToAnswer };
    }

    return { correct: false, points: 0, timeToAnswer };
  }

  /**
   * Check if all players have answered correctly
   */
  allPlayersAnswered(lobbyId: string): boolean {
    const lobby = this.lobbies.get(lobbyId);
    const round = this.activeRounds.get(lobbyId);

    if (!lobby || !round) {
      return false;
    }

    // Check if all players in the lobby have a correct answer
    return lobby.players.length === round.correctAnswers.size;
  }

  /**
   * End current round
   */
  endRound(lobbyId: string): { lobby: Lobby; round: GameRound; gameEnded: boolean } {
    const lobby = this.lobbies.get(lobbyId);
    const round = this.activeRounds.get(lobbyId);

    if (!lobby || !round) {
      throw new Error('No active round');
    }

    const gameEnded = lobby.currentRound >= lobby.settings.totalRounds;

    if (gameEnded) {
      lobby.status = 'finished';
    } else {
      lobby.currentRound++;
    }

    return { lobby, round, gameEnded };
  }

  /**
   * Get lobby by ID
   */
  getLobby(lobbyId: string): Lobby | undefined {
    return this.lobbies.get(lobbyId);
  }

  /**
   * Get all lobbies
   */
  getAllLobbies(): Lobby[] {
    return Array.from(this.lobbies.values());
  }

  /**
   * Get player's current lobby
   */
  getPlayerLobby(playerId: string): Lobby | undefined {
    const lobbyId = this.playerLobbyMap.get(playerId);
    return lobbyId ? this.lobbies.get(lobbyId) : undefined;
  }

  /**
   * Get active round for a lobby
   */
  getActiveRound(lobbyId: string): GameRound | undefined {
    return this.activeRounds.get(lobbyId);
  }
}
