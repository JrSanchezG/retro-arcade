import { useState, useEffect } from 'react';
import { arcadeGames } from './data/arcadeGames';
import type { ArcadeGame, GameGenre } from './types';
import { Header } from './components/Header';
import { GameCarousel } from './components/GameCarousel';
import { GameCard } from './components/GameCard';
import { ArcadeCabinetModal } from './components/ArcadeCabinetModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { Footer } from './components/Footer';
import { 
  playCoinSound, 
  setAudioMuted, 
  getAudioMuted
} from './utils/arcadeAudio';
import { 
  Gamepad2, 
  Sparkles, 
  Play, 
  Coins
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [credits, setCredits] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('arcade_credits') || 4);
    } catch {
      return 4;
    }
  });

  const [isCrtOn, setIsCrtOn] = useState(true);
  const [isMuted, setIsMuted] = useState(getAudioMuted());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<GameGenre>('all');
  const [activeGame, setActiveGame] = useState<ArcadeGame | null>(null);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [coinNotification, setCoinNotification] = useState<string | null>(null);

  // Global hotkeys (C = Insert Coin, ESC = Exit)
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      // Avoid triggering when user is typing in search input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === 'c' || e.key === 'C') {
        insertCoin();
      } else if (e.key === 'Escape') {
        setActiveGame(null);
        setIsLeaderboardOpen(false);
      }
    };

    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  const insertCoin = () => {
    playCoinSound();
    setCredits(prev => {
      const next = prev + 1;
      try {
        localStorage.setItem('arcade_credits', String(next));
      } catch {
        // fallback
      }
      return next;
    });

    setCoinNotification('+1 CRÉDITO INSERTADO');
    setTimeout(() => setCoinNotification(null), 2000);

    // Particle sparkle
    confetti({
      particleCount: 25,
      spread: 60,
      origin: { y: 0.1 },
      colors: ['#ffd700', '#00f0ff', '#a855f7'],
    });
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setAudioMuted(next);
    setIsMuted(next);
  };

  const handleSelectGame = (game: ArcadeGame) => {
    setActiveGame(game);
  };

  // Filtered games logic
  const filteredGames = arcadeGames.filter(game => {
    const matchesGenre = selectedGenre === 'all' || game.genre === selectedGenre;
    const matchesSearch =
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.genreLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  // Categorized subsets for genre carousels
  const classicsGames = arcadeGames.filter(g => g.genre === 'classics');
  const actionGames = arcadeGames.filter(g => g.genre === 'action');
  const puzzleGames = arcadeGames.filter(g => g.genre === 'puzzle');
  const sportsGames = arcadeGames.filter(g => g.genre === 'sports');

  // Featured hero game (Snake or first game)
  const heroGame = arcadeGames[0];

  return (
    <div className={`min-h-screen bg-arcade-darkest text-slate-100 flex flex-col selection:bg-arcade-gold selection:text-black ${isCrtOn ? 'crt-effect' : ''}`}>
      
      {/* Global Header */}
      <Header
        credits={credits}
        onInsertCoin={insertCoin}
        isCrtOn={isCrtOn}
        onToggleCrt={() => setIsCrtOn(prev => !prev)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedGenre={selectedGenre}
        onSelectGenre={setSelectedGenre}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
      />

      {/* Floating Coin Notification */}
      {coinNotification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="px-4 py-2 bg-arcade-gold text-black font-pixel text-xs font-black rounded-full shadow-neon-gold border-2 border-yellow-300 flex items-center gap-2">
            <Coins className="w-4 h-4 fill-black" />
            <span>{coinNotification}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        
        {/* Hero Banner (Only shown when not actively searching or filtering by single genre) */}
        {selectedGenre === 'all' && !searchQuery && (
          <div className="relative mb-12 rounded-3xl overflow-hidden border-2 border-arcade-gold/50 shadow-neon-gold bg-gradient-to-r from-arcade-darkpurple via-arcade-dark to-[#12072b]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(0,240,255,0.15),transparent_60%)] pointer-events-none" />

            <div className="p-6 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              
              {/* Hero Left Copy */}
              <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-arcade-gold/15 border border-arcade-gold/50 text-arcade-gold font-pixel text-[10px]">
                  <Sparkles className="w-3.5 h-3.5 text-arcade-gold" />
                  <span>SALA DE JUEGOS RETRO VINTAGE 198X</span>
                </div>

                <h2 className="font-pixel text-2xl sm:text-4xl text-white leading-relaxed glow-gold">
                  VIVE LA ERA DORADA DEL <span className="text-arcade-cyan glow-cyan">ARCADE</span>
                </h2>

                <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed max-w-xl">
                  Selecciona cualquiera de nuestros videojuegos clásicos con animaciones de previsualización en video, controles interactivos a 60 FPS y acceso directo al <strong className="text-emerald-400">código fuente en Python (Pygame)</strong>.
                </p>

                {/* Hero CTAs */}
                <div className="pt-2 flex flex-wrap gap-3 justify-center lg:justify-start">
                  <button
                    onClick={() => handleSelectGame(heroGame)}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-arcade-gold to-yellow-500 hover:brightness-110 text-black font-pixel text-xs font-bold shadow-neon-gold transition-all active:scale-95 flex items-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-black" />
                    <span>JUGAR {heroGame.title.toUpperCase()}</span>
                  </button>

                  <button
                    onClick={insertCoin}
                    className="px-5 py-3 rounded-xl bg-arcade-dark hover:bg-arcade-panel border border-arcade-cyan/40 text-arcade-cyan font-pixel text-xs transition-colors flex items-center gap-2 shadow-xs"
                  >
                    <Coins className="w-4 h-4" />
                    <span>INSERTAR FICHA [C]</span>
                  </button>
                </div>
              </div>

              {/* Hero Right Interactive Machine Showcase */}
              <div className="lg:col-span-5 flex justify-center">
                <div 
                  onClick={() => handleSelectGame(heroGame)}
                  className="w-full max-w-[340px] bg-arcade-darkest border-4 border-arcade-cyan/70 rounded-2xl p-3 shadow-neon-cyan cursor-pointer group hover:scale-105 transition-all"
                >
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3 crt-effect">
                    <img 
                      src={heroGame.coverImage} 
                      alt={heroGame.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="p-3.5 rounded-full bg-arcade-gold/90 text-black shadow-neon-gold group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 fill-black translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="text-center font-pixel">
                    <span className="text-[10px] text-arcade-gold block mb-1">DESTACADO DE LA SEMANA</span>
                    <h4 className="text-white text-sm group-hover:text-arcade-cyan transition-colors">{heroGame.title}</h4>
                    <span className="text-[9px] text-slate-400 font-mono mt-1 block">Récord: {heroGame.highScore} pts</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* View Mode 1: Search / Genre Filter Active */}
        {(selectedGenre !== 'all' || searchQuery) ? (
          <div>
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
              <div>
                <h2 className="font-pixel text-lg text-arcade-gold uppercase">
                  {searchQuery ? `RESULTADOS DE BÚSQUEDA: "${searchQuery}"` : `CATEGORÍA: ${selectedGenre.toUpperCase()}`}
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Se encontraron {filteredGames.length} juegos disponibles
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedGenre('all');
                  setSearchQuery('');
                }}
                className="px-3 py-1.5 rounded-lg bg-arcade-dark border border-slate-700 hover:border-arcade-gold text-slate-300 font-pixel text-[10px] transition-colors"
              >
                Limpiar Filtros
              </button>
            </div>

            {filteredGames.length === 0 ? (
              <div className="py-20 text-center font-pixel space-y-3">
                <Gamepad2 className="w-12 h-12 text-slate-600 mx-auto animate-bounce" />
                <h3 className="text-base text-slate-400">NO SE ENCONTRARON VIDEOJUEGOS</h3>
                <p className="text-xs text-slate-600 font-mono">Prueba buscando "Snake", "Tetris", "Pong" o "Breakout"</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredGames.map(game => (
                  <GameCard
                    key={game.id}
                    game={game}
                    onSelectGame={handleSelectGame}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* View Mode 2: Multi-Genre Carousels */
          <div className="space-y-8">
            {/* Carousel 1: Clásicos Inmortales */}
            <GameCarousel
              title="★ CLÁSICOS RETRO INMORTALES ★"
              subtitle="Los pioneros que definieron la historia del entretenimiento digital"
              games={classicsGames}
              onSelectGame={handleSelectGame}
              accentColor="gold"
            />

            {/* Carousel 2: Acción & Rompeladrillos */}
            <GameCarousel
              title="⚡ ACCIÓN, REFLEJOS & ROMPELADRILLOS"
              subtitle="Desafíos de alta velocidad y precisión milimétrica"
              games={actionGames}
              onSelectGame={handleSelectGame}
              accentColor="purple"
            />

            {/* Carousel 3: Puzzles & Lógica */}
            <GameCarousel
              title="🧩 PUZZLES & ESTRATEGIA GEOMÉTRICA"
              subtitle="Pon a prueba tu agilidad mental y visión espacial"
              games={puzzleGames}
              onSelectGame={handleSelectGame}
              accentColor="cyan"
            />

            {/* Carousel 4: Deportes & Duelo de Paletas */}
            <GameCarousel
              title="🏓 DEPORTES RETRO & DUELOS"
              subtitle="Compite cara a cara contra la máquina o amigos en 2P"
              games={sportsGames}
              onSelectGame={handleSelectGame}
              accentColor="gold"
            />
          </div>
        )}

      </main>

      {/* Active Arcade Cabinet Modal Screen */}
      <ArcadeCabinetModal
        game={activeGame}
        onClose={() => setActiveGame(null)}
        credits={credits}
        onInsertCoin={insertCoin}
        isCrtOn={isCrtOn}
        onToggleCrt={() => setIsCrtOn(prev => !prev)}
      />

      {/* Leaderboard Hall of Fame Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
      />

      {/* Footer */}
      <Footer />

    </div>
  );
}
