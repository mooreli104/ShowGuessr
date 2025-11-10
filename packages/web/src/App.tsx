import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Lobby } from './pages/Lobby';
import { Game } from './pages/Game';
import { useSocket } from './hooks/useSocket';
import { useGameStore } from './stores/gameStore';

function App() {
  // Initialize socket connection
  useSocket();
  const { theme, toggleTheme } = useGameStore();

  // Apply theme to body
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <button onClick={toggleTheme} className="theme-toggle" title="Toggle Theme">
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/game" element={<Game />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
