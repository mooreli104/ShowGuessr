import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShowType, LobbySettings } from '@showguessr/shared';
import { useSocket } from '../hooks/useSocket';
import { useGameStore } from '../stores/gameStore';

export const Home = () => {
  const navigate = useNavigate();
  const { createLobby, joinLobby } = useSocket();
  const { setUsername } = useGameStore();

  const [usernameInput, setUsernameInput] = useState('');
  const [lobbyName, setLobbyName] = useState('');
  const [lobbyIdInput, setLobbyIdInput] = useState('');
  const [showType, setShowType] = useState<ShowType>(ShowType.ANIME);
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [roundDuration, setRoundDuration] = useState(30);
  const [totalRounds, setTotalRounds] = useState(10);

  const handleCreateLobby = () => {
    if (!usernameInput || !lobbyName) return;

    const settings: LobbySettings = {
      maxPlayers,
      roundDuration,
      totalRounds,
      showType,
    };

    setUsername(usernameInput);
    createLobby(lobbyName, usernameInput, settings);
    navigate('/lobby');
  };

  const handleJoinLobby = () => {
    if (!usernameInput || !lobbyIdInput) return;

    setUsername(usernameInput);
    joinLobby(lobbyIdInput, usernameInput);
    navigate('/lobby');
  };

  return (
    <div className="card" style={{ maxWidth: '500px' }}>
      <div className="card-header">
        <h1>ShowGuessr</h1>
        <p>The multiplayer show guessing game</p>
      </div>

      <div className="form-group">
        <label>Your Username</label>
        <input
          type="text"
          placeholder="Enter your username"
          value={usernameInput}
          onChange={(e) => setUsernameInput(e.target.value)}
        />
      </div>

      <div className="divider">Create</div>

      <div className="form-group">
        <input
          type="text"
          placeholder="Lobby name"
          value={lobbyName}
          onChange={(e) => setLobbyName(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Show Type</label>
        <select value={showType} onChange={(e) => setShowType(e.target.value as ShowType)}>
          <option value={ShowType.ANIME}>Anime</option>
          <option value={ShowType.MOVIE}>Movie</option>
          <option value={ShowType.CARTOON}>Cartoon</option>
          <option value={ShowType.TV_SERIES}>TV Series</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="form-group" style={{marginBottom: 0}}>
          <label>Players</label>
          <input type="number" min="2" max="20" value={maxPlayers} onChange={(e) => setMaxPlayers(parseInt(e.target.value))} />
        </div>
        <div className="form-group" style={{marginBottom: 0}}>
          <label>Rounds</label>
          <input type="number" min="1" max="50" value={totalRounds} onChange={(e) => setTotalRounds(parseInt(e.target.value))} />
        </div>
        <div className="form-group" style={{marginBottom: 0}}>
          <label>Time (s)</label>
          <input type="number" min="10" max="120" value={roundDuration} onChange={(e) => setRoundDuration(parseInt(e.target.value))} />
        </div>
      </div>

      <button onClick={handleCreateLobby} disabled={!usernameInput || !lobbyName}>
        Create Lobby
      </button>

      <div className="divider">Join</div>

      <div className="form-group">
        <input
          type="text"
          placeholder="Enter Lobby ID"
          value={lobbyIdInput}
          onChange={(e) => setLobbyIdInput(e.target.value)}
        />
      </div>

      <button onClick={handleJoinLobby} disabled={!usernameInput || !lobbyIdInput} className="button-secondary">
        Join Lobby
      </button>
    </div>
  );
};
