import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';
import { useSocket } from '../hooks/useSocket';

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
  } = useGameStore();
  const { submitAnswer } = useSocket();

  const [answer, setAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(roundDuration);

  useEffect(() => {
    // Reset for new round
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

  if (!currentLobby || !imageUrl) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Waiting for game to start...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1>Round {currentRound} / {totalRounds}</h1>
          <p>Time Left: {timeLeft}s</p>
        </div>
        <div>
          <button onClick={() => navigate('/lobby')}>Back to Lobby</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Image Display */}
        <div style={{ textAlign: 'center' }}>
          <img
            src={imageUrl}
            alt="Guess this show"
            style={{ maxWidth: '100%', maxHeight: '500px', borderRadius: '8px' }}
          />

          <form onSubmit={handleSubmitAnswer} style={{ marginTop: '2rem' }}>
            <input
              type="text"
              placeholder="Type the show name..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={timeLeft === 0 || hasAnsweredCorrectly}
              style={{ width: '70%', padding: '0.75rem', fontSize: '1rem' }}
            />
            <button
              type="submit"
              disabled={!answer || timeLeft === 0 || hasAnsweredCorrectly}
              style={{ padding: '0.75rem 2rem', marginLeft: '1rem', fontSize: '1rem' }}
            >
              {hasAnsweredCorrectly ? 'Correct!' : 'Submit'}
            </button>
          </form>
        </div>

        {/* Leaderboard */}
        <div>
          <h2>Leaderboard</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {(leaderboard.length > 0 ? leaderboard : currentLobby.players)
              .map((player, index) => (
                <li
                  key={player.id}
                  style={{
                    padding: '0.75rem',
                    marginBottom: '0.5rem',
                    background: '#f0f0f0',
                    borderRadius: '4px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>
                      {index + 1}. {player.username}
                    </span>
                    <span>{player.score} pts</span>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
