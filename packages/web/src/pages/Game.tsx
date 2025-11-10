import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Player } from '@showguessr/shared';
import { useGameStore } from '../stores/gameStore';
import { useSocket } from '../hooks/useSocket';
import { socketService } from '../services/socket';

export const Game = () => {
  const navigate = useNavigate();
  const {
    currentLobby,
    currentRound,
    imageUrl,
    roundDuration,
    totalRounds,
    leaderboard,
    hasAnsweredCorrectly,
    setLeaderboard,
  } = useGameStore();
  const { submitAnswer, resetLobby, leaveLobby } = useSocket();

  const isHost = currentLobby?.hostId === useGameStore.getState().playerId;
  const [answer, setAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(roundDuration);
  const [roundEnded, setRoundEnded] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState('');

  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    const handleRoundEnd = (payload: { correctAnswer: string; leaderboard: Player[] }) => {
      setRoundEnded(true);
      setCorrectAnswer(payload.correctAnswer);
      setLeaderboard(payload.leaderboard);
    };

    socket.on('round_end', handleRoundEnd);
    return () => { socket.off('round_end', handleRoundEnd); };
  }, [setLeaderboard]);

  // Redirect to home if state is lost on refresh
  useEffect(() => {
    if (!currentLobby) {
      navigate('/');
    }
  }, [currentLobby, navigate]);

  useEffect(() => {
    // Reset for new round
    setRoundEnded(false);
    setAnswer('');
    setTimeLeft(roundDuration);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentRound, roundDuration]);

  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer || !currentLobby || hasAnsweredCorrectly) return;

    submitAnswer(currentLobby.id, answer);
    setAnswer(''); // Clear input after submission
  };
  
  const handleBackToLobby = useCallback(() => {
    if (isHost) {
      resetLobby();
    }
    // For non-hosts, the server will broadcast the lobby update,
    // and the useEffect in Lobby.tsx will handle navigation.
    // For the host, this ensures we navigate after resetting.
    navigate('/lobby');
  }, [isHost, navigate, resetLobby]);

  // Automatically return to lobby after game ends
  useEffect(() => {
    if (currentLobby?.status === 'finished') {
      const timer = setTimeout(() => {
        handleBackToLobby();
      }, 8000); // Wait 8 seconds on the "Game Over" screen
      return () => clearTimeout(timer);
    }
  }, [currentLobby?.status, handleBackToLobby]);

  const handleLeaveGame = () => {
    leaveLobby();
    navigate('/');
  };

  if (!currentLobby) {
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        <p>Loading game...</p>
      </div>
    );
  }

  // Game Finished View
  if (currentLobby.status === 'finished') {
    const sortedPlayers = [...(leaderboard.length > 0 ? leaderboard : currentLobby.players)].sort((a: Player, b: Player) => b.score - a.score);
    return (
      <div className="card" style={{ maxWidth: '600px' }}>
        <div className="card-header">
          <h1>Game Over!</h1>
          <p>Final Scores</p>
        </div>
        <ul className="player-list">
          {sortedPlayers.map((player: Player, index: number) => (
            <li key={player.id}>
              <span>{index + 1}. {player.username}</span>
              <span>{player.score} points</span>
            </li>
          ))}
        </ul>
        <button onClick={handleBackToLobby} style={{ marginTop: '2rem' }}>
          {isHost ? 'Reset and Return to Lobby' : 'Back to Lobby'}
        </button>
      </div>
    );
  }

  // Active Game View
  if (!imageUrl) {
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        <p>Waiting for game to start...</p>
      </div>
    );
  }

  // Intermission View (between rounds)
  if (roundEnded) {
    return (
      <div className="card" style={{ maxWidth: '600px', textAlign: 'center' }}>
        <div className="card-header">
          <h1>Round Over!</h1>
          <p>The correct answer was:</p>
          <h2 style={{ color: 'var(--success-color)', marginTop: '1rem' }}>{correctAnswer}</h2>
        </div>
        <h3 style={{ marginBottom: '1rem' }}>Leaderboard</h3>
        <ul className="player-list">
          {leaderboard.map((player: Player, index: number) => (
            <li key={player.id}>
              <span>{index + 1}. {player.username}</span>
              <span>{player.score} points</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
      <div className="game-layout">
        {/* Image Display */}
        <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>Round {currentRound} / {totalRounds}</h2>
            <div className={`game-timer ${timeLeft <= 10 ? 'low-time' : ''}`}>{timeLeft}s</div>
          </div>
          <img
            src={imageUrl}
            alt="Guess this show"
            style={{ width: '100%', maxHeight: 'calc(100vh - 250px)', objectFit: 'contain', borderRadius: '8px' }}
          />

          <form onSubmit={handleSubmitAnswer} style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
            <input
              type="text"
              placeholder="Type the show name..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={timeLeft === 0 || hasAnsweredCorrectly} style={{flexGrow: 1}}
            />
            <button
              type="submit"
              disabled={!answer || timeLeft === 0 || hasAnsweredCorrectly}
              style={{ width: 'auto' }}
            >
              {hasAnsweredCorrectly ? 'Correct!' : 'Submit'}
            </button>
          </form>
        </div>

        {/* Leaderboard */}
        <div className="card">
          <h2 style={{ marginBottom: '1rem', textAlign: 'center' }}>Leaderboard</h2>
          <ul className="player-list">
            {(leaderboard.length > 0 ? leaderboard : currentLobby.players)
              .map((player: Player, index: number) => (
                <li key={player.id}>
                  <span>
                    {index + 1}. {player.username}
                  </span>
                  <span>{player.score} pts</span>
                </li>
              ))}
          </ul>
          <button onClick={handleLeaveGame} className="button-secondary" style={{ marginTop: '1rem' }}>
            Leave Game
          </button>
        </div>
      </div>
  );
};
