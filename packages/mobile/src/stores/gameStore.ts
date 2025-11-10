import { create } from 'zustand';
import { Lobby, Player } from '@showguessr/shared';

interface GameState {
  playerId: string | null;
  username: string | null;
  currentLobby: Lobby | null;
  currentRound: number;
  imageUrl: string | null;
  roundDuration: number;
  totalRounds: number;
  leaderboard: Player[];
  hasAnsweredCorrectly: boolean;
  isConnected: boolean;
  error: string | null;

  setPlayerId: (id: string) => void;
  setUsername: (name: string) => void;
  setCurrentLobby: (lobby: Lobby | null) => void;
  setCurrentRound: (round: number) => void;
  setImageUrl: (url: string | null) => void;
  setRoundInfo: (duration: number, total: number) => void;
  setLeaderboard: (players: Player[]) => void;
  setConnected: (connected: boolean) => void;
  setError: (error: string | null) => void;
  setHasAnsweredCorrectly: (answered: boolean) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  playerId: null,
  username: null,
  currentLobby: null,
  currentRound: 0,
  imageUrl: null,
  roundDuration: 30,
  totalRounds: 10,
  leaderboard: [],
  hasAnsweredCorrectly: false,
  isConnected: false,
  error: null,

  setPlayerId: (id) => set({ playerId: id }),
  setUsername: (name) => set({ username: name }),
  setCurrentLobby: (lobby) => set({ currentLobby: lobby }),
  setCurrentRound: (round) => set({ currentRound: round, hasAnsweredCorrectly: false }),
  setImageUrl: (url) => set({ imageUrl: url }),
  setRoundInfo: (duration, total) => set({ roundDuration: duration, totalRounds: total }),
  setLeaderboard: (players) => set({ leaderboard: players }),
  setConnected: (connected) => set({ isConnected: connected }),
  setError: (error) => set({ error }),
  setHasAnsweredCorrectly: (answered) => set({ hasAnsweredCorrectly: answered }),
  resetGame: () => set({
    currentLobby: null,
    currentRound: 0,
    imageUrl: null,
    leaderboard: [],
    hasAnsweredCorrectly: false,
    error: null,
  }),
}));
