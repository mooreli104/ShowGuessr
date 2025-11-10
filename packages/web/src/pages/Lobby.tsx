import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';
import { useSocket } from '../hooks/useSocket';

export const Lobby = () => {
  const navigate = useNavigate();
  const { currentLobby, playerId } = useGameStore();
  const { leaveLobby, startGame } = useSocket();

  const isHost = currentLobby?.hostId === playerId;

  const handleLeaveLobby = () => {
    leaveLobby();
    navigate('/');
  };

  const handleStartGame = () => {
    if (isHost) {
      startGame();
      navigate('/game');
    }
  };

  if (!currentLobby) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading lobby...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>{currentLobby.name}</h1>
      <p>Lobby ID: {currentLobby.id}</p>
      <p>Status: {currentLobby.status}</p>

      <div style={{ marginTop: '2rem' }}>
        <h2>Settings</h2>
        <ul>
          <li>Show Type: {currentLobby.settings.showType}</li>
          <li>Max Players: {currentLobby.settings.maxPlayers}</li>
          <li>Round Duration: {currentLobby.settings.roundDuration}s</li>
          <li>Total Rounds: {currentLobby.settings.totalRounds}</li>
          <li>Difficulty: {currentLobby.settings.difficulty}</li>
        </ul>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>Players ({currentLobby.players.length}/{currentLobby.settings.maxPlayers})</h2>
        <ul>
          {currentLobby.players.map((player) => (
            <li key={player.id}>
              {player.username} {player.isHost && '(Host)'} - Score: {player.score}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <button
          onClick={handleLeaveLobby}
          style={{ padding: '0.75rem 2rem' }}
        >
          Leave Lobby
        </button>

        {isHost && (
          <button
            onClick={handleStartGame}
            disabled={currentLobby.players.length < 2}
            style={{ padding: '0.75rem 2rem' }}
          >
            Start Game
          </button>
        )}
      </div>
    </div>
  );
};
