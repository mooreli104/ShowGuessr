import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';
import { useSocket } from '../hooks/useSocket';

export const Lobby = () => {
  const navigate = useNavigate();
  const { currentLobby, playerId } = useGameStore();
  const { leaveLobby, startGame } = useSocket();

  const isHost = currentLobby?.hostId === playerId;

  // Navigate based on lobby status
  useEffect(() => {
    const status = currentLobby?.status;
    if (status === 'playing' || status === 'finished') {
      navigate('/game');
    }
  }, [currentLobby?.status, navigate]);

  const handleLeaveLobby = () => {
    leaveLobby();
    navigate('/');
  };

  const handleStartGame = () => {
    if (isHost) {
      startGame();
      // Navigation will happen via useEffect when status changes
    }
  };

  if (!currentLobby) {
    return (
      <div className="card">
        <p>Loading lobby...</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: '600px' }}>
      <div className="card-header" style={{ marginBottom: '1rem' }}>
        <h1>{currentLobby.name}</h1>
        <p>Lobby ID: <span style={{ color: 'var(--text-primary)', userSelect: 'all' }}>{currentLobby.id}</span></p>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Settings</h3>
        <ul className="settings-list">
          <li><span>Show Type:</span> <span>{currentLobby.settings.showType}</span></li>
          <li><span>Total Rounds:</span> <span>{currentLobby.settings.totalRounds}</span></li>
          <li><span>Round Duration:</span> <span>{currentLobby.settings.roundDuration}s</span></li>
          <li><span>Difficulty:</span> <span>{currentLobby.settings.difficulty}</span></li>
        </ul>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Players ({currentLobby.players.length}/{currentLobby.settings.maxPlayers})</h3>
        <ul className="player-list">
          {currentLobby.players.map((player) => (
            <li key={player.id}>
              <span>{player.username} {player.isHost && <span className="host-tag">Host</span>}</span>
              <span>{player.score} pts</span>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <button onClick={handleLeaveLobby} className="button-secondary">
          Leave Lobby
        </button>

        {isHost && (
          <button onClick={handleStartGame} disabled={currentLobby.players.length < 2}>
            {currentLobby.players.length < 2 ? 'Need more players' : 'Start Game'}
          </button>
        )}
      </div>
    </div>
  );
};
