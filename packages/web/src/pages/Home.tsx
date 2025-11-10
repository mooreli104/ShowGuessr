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
      difficulty: 'medium',
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
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>ShowGuessr</h1>
      <p>Multiplayer show guessing game</p>

      <div style={{ marginTop: '2rem' }}>
        <input
          type="text"
          placeholder="Enter your username"
          value={usernameInput}
          onChange={(e) => setUsernameInput(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
        />

        <h2>Create Lobby</h2>
        <input
          type="text"
          placeholder="Lobby name"
          value={lobbyName}
          onChange={(e) => setLobbyName(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
        />

        <div style={{ marginBottom: '1rem' }}>
          <label>Show Type: </label>
          <select value={showType} onChange={(e) => setShowType(e.target.value as ShowType)}>
            <option value={ShowType.ANIME}>Anime</option>
            <option value={ShowType.MOVIE}>Movie</option>
            <option value={ShowType.CARTOON}>Cartoon</option>
            <option value={ShowType.TV_SERIES}>TV Series</option>
          </select>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Max Players: </label>
          <input
            type="number"
            min="2"
            max="20"
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Round Duration (seconds): </label>
          <input
            type="number"
            min="10"
            max="120"
            value={roundDuration}
            onChange={(e) => setRoundDuration(parseInt(e.target.value))}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Total Rounds: </label>
          <input
            type="number"
            min="1"
            max="50"
            value={totalRounds}
            onChange={(e) => setTotalRounds(parseInt(e.target.value))}
          />
        </div>

        <button
          onClick={handleCreateLobby}
          disabled={!usernameInput || !lobbyName}
          style={{ width: '100%', padding: '0.75rem', marginBottom: '2rem' }}
        >
          Create Lobby
        </button>

        <h2>Join Lobby</h2>
        <input
          type="text"
          placeholder="Lobby ID"
          value={lobbyIdInput}
          onChange={(e) => setLobbyIdInput(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
        />

        <button
          onClick={handleJoinLobby}
          disabled={!usernameInput || !lobbyIdInput}
          style={{ width: '100%', padding: '0.75rem' }}
        >
          Join Lobby
        </button>
      </div>
    </div>
  );
};
