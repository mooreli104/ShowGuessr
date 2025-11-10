import { Server, Socket } from 'socket.io';
import {
  SocketEvent,
  CreateLobbyPayload,
  JoinLobbyPayload,
  SubmitAnswerPayload,
  AnswerResultPayload,
  RoundEndPayload,
  GameEndPayload
} from '@showguessr/shared';
import { LobbyManager } from '../services/LobbyManager.js';

/**
 * Handles all socket.io events
 */
export class SocketController {
  private io: Server;
  private lobbyManager: LobbyManager;
  private socketPlayerMap: Map<string, string> = new Map(); // socketId -> playerId
  private roundTimers: Map<string, NodeJS.Timeout> = new Map(); // lobbyId -> timer

  constructor(io: Server) {
    this.io = io;
    this.lobbyManager = new LobbyManager();
  }

  /**
   * Initialize socket event handlers
   */
  initialize() {
    this.io.on(SocketEvent.CONNECT, (socket: Socket) => {
      console.log(`Client connected: ${socket.id}`);

      this.handleCreateLobby(socket);
      this.handleJoinLobby(socket);
      this.handleLeaveLobby(socket);
      this.handleUpdateSettings(socket);
      this.handleStartGame(socket);
      this.handleSubmitAnswer(socket);
      this.handleDisconnect(socket);
    });
  }

  /**
   * Handle lobby creation
   */
  private handleCreateLobby(socket: Socket) {
    socket.on(SocketEvent.CREATE_LOBBY, (payload: CreateLobbyPayload) => {
      try {
        const { lobby, player } = this.lobbyManager.createLobby(
          payload.username,
          payload.lobbyName,
          payload.settings
        );

        this.socketPlayerMap.set(socket.id, player.id);
        socket.join(lobby.id);

        socket.emit(SocketEvent.LOBBY_CREATED, { lobby, playerId: player.id });
        console.log(`Lobby created: ${lobby.id} by ${player.username}`);
      } catch (error) {
        socket.emit(SocketEvent.ERROR, { message: (error as Error).message });
      }
    });
  }

  /**
   * Handle joining a lobby
   */
  private handleJoinLobby(socket: Socket) {
    socket.on(SocketEvent.JOIN_LOBBY, (payload: JoinLobbyPayload) => {
      try {
        const { lobby, player } = this.lobbyManager.joinLobby(
          payload.lobbyId,
          payload.username
        );

        this.socketPlayerMap.set(socket.id, player.id);
        socket.join(lobby.id);

        // Notify the player
        socket.emit(SocketEvent.LOBBY_CREATED, { lobby, playerId: player.id });

        // Notify others in the lobby
        socket.to(lobby.id).emit(SocketEvent.PLAYER_JOINED, { player, lobby });

        console.log(`${player.username} joined lobby: ${lobby.id}`);
      } catch (error) {
        socket.emit(SocketEvent.ERROR, { message: (error as Error).message });
      }
    });
  }

  /**
   * Handle leaving a lobby
   */
  private handleLeaveLobby(socket: Socket) {
    socket.on(SocketEvent.LEAVE_LOBBY, () => {
      this.handlePlayerLeave(socket.id);
    });
  }

  /**
   * Handle player disconnect
   */
  private handleDisconnect(socket: Socket) {
    socket.on(SocketEvent.DISCONNECT, () => {
      console.log(`Client disconnected: ${socket.id}`);
      this.handlePlayerLeave(socket.id);
    });
  }

  /**
   * Common logic for player leaving
   */
  private handlePlayerLeave(socketId: string) {
    const playerId = this.socketPlayerMap.get(socketId);
    if (!playerId) return;

    try {
      const { lobbyId, shouldDeleteLobby, newHost } = this.lobbyManager.leaveLobby(playerId);

      if (!shouldDeleteLobby) {
        const lobby = this.lobbyManager.getLobby(lobbyId);
        if (lobby) {
          this.io.to(lobbyId).emit(SocketEvent.PLAYER_LEFT, { playerId, lobby, newHost });
        }
      }

      this.socketPlayerMap.delete(socketId);
    } catch (error) {
      console.error('Error handling player leave:', error);
    }
  }

  /**
   * Handle settings update
   */
  private handleUpdateSettings(socket: Socket) {
    socket.on(SocketEvent.UPDATE_SETTINGS, (settings) => {
      const playerId = this.socketPlayerMap.get(socket.id);
      if (!playerId) return;

      try {
        const lobby = this.lobbyManager.updateSettings(playerId, settings);
        this.io.to(lobby.id).emit(SocketEvent.LOBBY_UPDATED, { lobby });
      } catch (error) {
        socket.emit(SocketEvent.ERROR, { message: (error as Error).message });
      }
    });
  }

  /**
   * Handle game start
   */
  private handleStartGame(socket: Socket) {
    socket.on(SocketEvent.START_GAME, async () => {
      const playerId = this.socketPlayerMap.get(socket.id);
      if (!playerId) return;

      try {
        const { lobby, round } = await this.lobbyManager.startGame(playerId);

        // Notify all players
        this.io.to(lobby.id).emit(SocketEvent.GAME_STARTED, { lobby });

        // Start first round
        this.io.to(lobby.id).emit(SocketEvent.NEW_ROUND, {
          roundNumber: round.roundNumber,
          imageUrl: round.showContent.imageUrl,
          totalRounds: lobby.settings.totalRounds,
          duration: lobby.settings.roundDuration
        });

        // Schedule round end
        const timer = setTimeout(() => {
          this.endRound(lobby.id);
        }, lobby.settings.roundDuration * 1000);
        this.roundTimers.set(lobby.id, timer);

      } catch (error) {
        socket.emit(SocketEvent.ERROR, { message: (error as Error).message });
      }
    });
  }

  /**
   * Handle answer submission
   */
  private handleSubmitAnswer(socket: Socket) {
    socket.on(SocketEvent.SUBMIT_ANSWER, (payload: SubmitAnswerPayload) => {
      const playerId = this.socketPlayerMap.get(socket.id);
      if (!playerId) return;

      try {
        const result = this.lobbyManager.submitAnswer(playerId, payload.answer);
        const lobby = this.lobbyManager.getPlayerLobby(playerId);

        if (!lobby) return;

        const player = lobby.players.find(p => p.id === playerId);
        if (!player) return;

        const answerResult: AnswerResultPayload = {
          playerId: player.id,
          username: player.username,
          correct: result.correct,
          points: result.points,
          timeToAnswer: result.timeToAnswer
        };

        // Notify all players in the lobby
        this.io.to(lobby.id).emit(SocketEvent.ANSWER_RESULT, answerResult);

        // If answer was correct and points were awarded, broadcast updated lobby state
        if (result.correct && result.points > 0) {
          this.io.to(lobby.id).emit(SocketEvent.LOBBY_UPDATED, { lobby });
        }

        // Check if all players have answered correctly
        if (result.correct && this.lobbyManager.allPlayersAnswered(lobby.id)) {
          // Clear the round timer
          const timer = this.roundTimers.get(lobby.id);
          if (timer) {
            clearTimeout(timer);
            this.roundTimers.delete(lobby.id);
          }

          // End the round immediately
          this.endRound(lobby.id);
        }

      } catch (error) {
        socket.emit(SocketEvent.ERROR, { message: (error as Error).message });
      }
    });
  }

  /**
   * End the current round
   */
  private async endRound(lobbyId: string) {
    try {
      const { lobby, round, gameEnded } = this.lobbyManager.endRound(lobbyId);

      const roundEndPayload: RoundEndPayload = {
        correctAnswer: round.showContent.title,
        leaderboard: [...lobby.players].sort((a, b) => b.score - a.score),
        nextRoundIn: gameEnded ? undefined : 5
      };

      this.io.to(lobbyId).emit(SocketEvent.ROUND_END, roundEndPayload);

      if (gameEnded) {
        // Game is over
        const sortedPlayers = [...lobby.players].sort((a, b) => b.score - a.score);
        const gameEndPayload: GameEndPayload = {
          finalLeaderboard: sortedPlayers,
          winner: sortedPlayers[0]
        };

        this.io.to(lobbyId).emit(SocketEvent.GAME_END, gameEndPayload);
      } else {
        // Start next round after 5 seconds
        setTimeout(async () => {
          try {
            const nextRound = await this.lobbyManager.startNewRound(lobbyId);

            this.io.to(lobbyId).emit(SocketEvent.NEW_ROUND, {
              roundNumber: nextRound.roundNumber,
              imageUrl: nextRound.showContent.imageUrl,
              totalRounds: lobby.settings.totalRounds,
              duration: lobby.settings.roundDuration
            });

            // Schedule next round end
            const timer = setTimeout(() => {
              this.endRound(lobbyId);
            }, lobby.settings.roundDuration * 1000);
            this.roundTimers.set(lobbyId, timer);

          } catch (error) {
            console.error('Error starting next round:', error);
          }
        }, 5000);
      }

    } catch (error) {
      console.error('Error ending round:', error);
    }
  }
}
