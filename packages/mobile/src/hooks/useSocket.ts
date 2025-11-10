import { useEffect } from 'react';
import {
  SocketEvent,
  CreateLobbyPayload,
  JoinLobbyPayload,
  SubmitAnswerPayload,
  LobbySettings
} from '@showguessr/shared';
import { socketService } from '../services/socket';
import { useGameStore } from '../stores/gameStore';

export const useSocket = () => {
  const {
    playerId,
    setPlayerId,
    setCurrentLobby,
    setCurrentRound,
    setImageUrl,
    setRoundInfo,
    setLeaderboard,
    setConnected,
    setError,
    setHasAnsweredCorrectly,
  } = useGameStore();

  useEffect(() => {
    const socket = socketService.connect();

    socket.on(SocketEvent.CONNECT, () => {
      setConnected(true);
      setError(null);
    });

    socket.on(SocketEvent.DISCONNECT, () => {
      setConnected(false);
    });

    socket.on(SocketEvent.ERROR, (data: { message: string }) => {
      setError(data.message);
    });

    socket.on(SocketEvent.LOBBY_CREATED, (data: { lobby: any; playerId: string }) => {
      setPlayerId(data.playerId);
      setCurrentLobby(data.lobby);
    });

    socket.on(SocketEvent.LOBBY_UPDATED, (data: { lobby: any }) => {
      setCurrentLobby(data.lobby);
    });

    socket.on(SocketEvent.PLAYER_JOINED, (data: { player: any; lobby: any }) => {
      setCurrentLobby(data.lobby);
    });

    socket.on(SocketEvent.PLAYER_LEFT, (data: { playerId: string; lobby: any }) => {
      setCurrentLobby(data.lobby);
    });

    socket.on(SocketEvent.GAME_STARTED, (data: { lobby: any }) => {
      setCurrentLobby(data.lobby);
    });

    socket.on(SocketEvent.NEW_ROUND, (data: {
      roundNumber: number;
      imageUrl: string;
      totalRounds: number;
      duration: number;
    }) => {
      setCurrentRound(data.roundNumber);
      setImageUrl(data.imageUrl);
      setRoundInfo(data.duration, data.totalRounds);
    });

    socket.on(SocketEvent.ROUND_END, (data: {
      correctAnswer: string;
      leaderboard: any[];
    }) => {
      setLeaderboard(data.leaderboard);
    });

    socket.on(SocketEvent.GAME_END, (data: {
      finalLeaderboard: any[];
      winner: any;
    }) => {
      setLeaderboard(data.finalLeaderboard);
    });

    socket.on(SocketEvent.ANSWER_RESULT, (data: {
      playerId: string;
      username: string;
      correct: boolean;
      points: number;
      timeToAnswer: number;
    }) => {
      // If this is the current player and they answered correctly, disable further guessing
      if (data.playerId === playerId && data.correct && data.points > 0) {
        setHasAnsweredCorrectly(true);
      }
    });

    return () => {
      socket.off(SocketEvent.CONNECT);
      socket.off(SocketEvent.DISCONNECT);
      socket.off(SocketEvent.ERROR);
      socket.off(SocketEvent.LOBBY_CREATED);
      socket.off(SocketEvent.LOBBY_UPDATED);
      socket.off(SocketEvent.PLAYER_JOINED);
      socket.off(SocketEvent.PLAYER_LEFT);
      socket.off(SocketEvent.GAME_STARTED);
      socket.off(SocketEvent.NEW_ROUND);
      socket.off(SocketEvent.ROUND_END);
      socket.off(SocketEvent.GAME_END);
      socket.off(SocketEvent.ANSWER_RESULT);
    };
  }, [playerId, setHasAnsweredCorrectly]);

  const createLobby = (lobbyName: string, username: string, settings: LobbySettings) => {
    const socket = socketService.getSocket();
    if (!socket) return;

    const payload: CreateLobbyPayload = {
      lobbyName,
      username,
      settings,
    };

    socket.emit(SocketEvent.CREATE_LOBBY, payload);
  };

  const joinLobby = (lobbyId: string, username: string) => {
    const socket = socketService.getSocket();
    if (!socket) return;

    const payload: JoinLobbyPayload = {
      lobbyId,
      username,
    };

    socket.emit(SocketEvent.JOIN_LOBBY, payload);
  };

  const leaveLobby = () => {
    const socket = socketService.getSocket();
    if (!socket) return;

    socket.emit(SocketEvent.LEAVE_LOBBY);
  };

  const startGame = () => {
    const socket = socketService.getSocket();
    if (!socket) return;

    socket.emit(SocketEvent.START_GAME);
  };

  const submitAnswer = (lobbyId: string, answer: string) => {
    const socket = socketService.getSocket();
    if (!socket) return;

    const payload: SubmitAnswerPayload = {
      lobbyId,
      answer,
    };

    socket.emit(SocketEvent.SUBMIT_ANSWER, payload);
  };

  const updateSettings = (settings: Partial<LobbySettings>) => {
    const socket = socketService.getSocket();
    if (!socket) return;

    socket.emit(SocketEvent.UPDATE_SETTINGS, settings);
  };

  return {
    createLobby,
    joinLobby,
    leaveLobby,
    startGame,
    submitAnswer,
    updateSettings,
  };
};
