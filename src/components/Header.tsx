import React from 'react';
import type { GameGenre } from '../types';
import { 
  Gamepad2, 
  Coins, 
  Tv, 
  Volume2, 
  VolumeX, 
  Search, 
  Trophy
} from 'lucide-react';
import { playHoverSound } from '../utils/arcadeAudio';

interface HeaderProps {
  credits: number;
  onInsertCoin: () => void;
  isCrtOn: boolean;
  onToggleCrt: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedGenre: GameGenre;
  onSelectGenre: (genre: GameGenre) => void;
  onOpenLeaderboard: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  credits,
  onInsertCoin,
  isCrtOn,
  onToggleCrt,
  isMuted,
  onToggleMute,
  searchQuery,
  onSearchChange,
  selectedGenre,
  onSelectGenre,
  onOpenLeaderboard,
}) => {
  const genres: { id: GameGenre; label: string }[] = [
    { id: 'all', label: 'Todos' },
    { id: 'classics', label: 'Clásicos 80s' },
    { id: 'action', label: 'Acción' },
    { id: 'puzzle', label: 'Puzzles' },
    { id: 'sports', label: 'Deportes' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-arcade-darkest/95 backdrop-blur-xl border-b-2 border-arcade-purple/40 shadow-lg">
      {/* Top Retro Striped Marquee Banner */}
      <div className="bg-gradient-to-r from-arcade-darkpurple via-arcade-panel to-arcade-darkpurple py-1 px-4 border-b border-arcade-gold/30 flex items-center justify-between text-[10px] font-pixel text-slate-300 overflow-hidden">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-arcade-gold">COIN-OP SALÓN RETRO 198X</span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="text-arcade-cyan hidden sm:inline">PROYECTOS EN PYTHON & REACT</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-arcade-purple animate-blink-fast hidden md:inline">
            ★ FREE PLAY READY ★
          </span>
          <span className="text-slate-400">PRESIONA 'C' PARA MONEDA</span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-arcade-purple via-arcade-cyan to-arcade-gold p-[2px] shadow-neon-gold">
              <div className="w-10 h-10 rounded-[14px] bg-arcade-darkest flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-arcade-gold animate-bounce" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-pixel text-lg sm:text-2xl text-white tracking-wider glow-gold">
                  ARCADE<span className="text-arcade-cyan glow-cyan">VAULT</span>
                </h1>
                <span className="px-2 py-0.5 rounded text-[9px] font-pixel bg-arcade-purple/20 text-arcade-purple border border-arcade-purple/50">
                  8-BIT
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono hidden sm:block">
                Colección Retro de Videojuegos Jugables & Código Python
              </p>
            </div>
          </div>

          {/* Action Center: Insert Coin, Leaderboard, CRT, Audio */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Insert Coin Mechanism */}
            <button
              onClick={onInsertCoin}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-arcade-gold via-amber-400 to-yellow-500 hover:brightness-110 text-black rounded-xl font-pixel text-xs font-black shadow-neon-gold transition-all active:scale-95"
              title="Insertar Ficha (Tecla C)"
            >
              <Coins className="w-4 h-4 fill-black animate-spin" style={{ animationDuration: '4s' }} />
              <span className="hidden sm:inline">INSERT COIN:</span>
              <span className="bg-black text-arcade-gold px-2 py-0.5 rounded font-mono font-black text-xs">
                {credits}
              </span>
            </button>

            {/* High Scores Hall of Fame Button */}
            <button
              onClick={onOpenLeaderboard}
              className="p-2 rounded-xl bg-arcade-dark border border-arcade-purple/40 text-arcade-purple hover:text-white hover:border-arcade-purple transition-all shadow-xs"
              title="Salón de la Fama / Récords"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
            </button>

            {/* CRT Scanline Toggle */}
            <button
              onClick={onToggleCrt}
              className={`p-2 rounded-xl border text-xs font-pixel transition-all flex items-center gap-1.5 ${
                isCrtOn
                  ? 'bg-arcade-cyan/20 border-arcade-cyan text-arcade-cyan shadow-neon-cyan'
                  : 'bg-arcade-dark border-slate-700 text-slate-400 hover:text-white'
              }`}
              title="Efecto CRT Retro (Scanlines)"
            >
              <Tv className="w-4 h-4" />
              <span className="hidden md:inline text-[9px]">CRT</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={onToggleMute}
              className="p-2 rounded-xl bg-arcade-dark border border-slate-700 hover:border-arcade-gold text-slate-400 hover:text-arcade-gold transition-colors"
              title={isMuted ? 'Activar sonido 8-bit' : 'Silenciar sonido'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-arcade-gold" />}
            </button>

          </div>

        </div>

        {/* Search Bar & Genre Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          
          {/* Genre Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar py-1">
            {genres.map(g => (
              <button
                key={g.id}
                onClick={() => {
                  onSelectGenre(g.id);
                  playHoverSound();
                }}
                className={`px-3 py-1.5 rounded-xl font-pixel text-[10px] whitespace-nowrap transition-all ${
                  selectedGenre === g.id
                    ? 'bg-arcade-purple text-white border-2 border-arcade-purple shadow-neon-purple'
                    : 'bg-arcade-dark text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar juego..."
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-arcade-dark border border-slate-800 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-arcade-cyan focus:shadow-neon-cyan transition-all"
            />
          </div>

        </div>
      </div>
    </header>
  );
};
