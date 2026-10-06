import React, { useState } from 'react';
import type { ArcadeGame } from '../types';
import { SnakeGame } from './games/SnakeGame';
import { PongGame } from './games/PongGame';
import { BlockbreakerGame } from './games/BlockbreakerGame';
import { TetrisGame } from './games/TetrisGame';
import { SpaceInvadersGame } from './games/SpaceInvadersGame';
import { PythonCodeViewer } from './PythonCodeViewer';
import { X, Gamepad2, Code, Sparkles, Tv, Coins } from 'lucide-react';
import { playHoverSound } from '../utils/arcadeAudio';

interface ArcadeCabinetModalProps {
  game: ArcadeGame | null;
  onClose: () => void;
  credits: number;
  onInsertCoin: () => void;
  isCrtOn: boolean;
  onToggleCrt: () => void;
}

export const ArcadeCabinetModal: React.FC<ArcadeCabinetModalProps> = ({
  game,
  onClose,
  credits,
  onInsertCoin,
  isCrtOn,
  onToggleCrt,
}) => {
  const [activeTab, setActiveTab] = useState<'play' | 'code'>('play');
  const [sessionScore, setSessionScore] = useState(0);

  if (!game) return null;

  const renderGameEngine = () => {
    switch (game.id) {
      case 'snake':
        return <SnakeGame onScoreUpdate={setSessionScore} />;
      case 'pong':
        return <PongGame onScoreUpdate={setSessionScore} />;
      case 'blockbreaker':
        return <BlockbreakerGame onScoreUpdate={setSessionScore} />;
      case 'tetris':
        return <TetrisGame onScoreUpdate={setSessionScore} />;
      case 'spaceinvaders':
        return <SpaceInvadersGame onScoreUpdate={setSessionScore} />;
      default:
        return <SnakeGame onScoreUpdate={setSessionScore} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      {/* Arcade Cabinet Outer Body */}
      <div className="relative w-full max-w-4xl bg-[#090514] border-4 border-arcade-gold/70 rounded-3xl shadow-[0_0_60px_rgba(255,215,0,0.25)] flex flex-col overflow-hidden my-auto max-h-[96vh]">
        
        {/* Top Glowing Marquee Sign */}
        <div className="relative px-6 py-3.5 bg-gradient-to-r from-arcade-darkpurple via-arcade-dark to-arcade-darkpurple border-b-2 border-arcade-gold/40 flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-arcade-gold/10 border border-arcade-gold/40 text-arcade-gold shadow-neon-gold">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-pixel text-[9px] text-arcade-cyan uppercase tracking-widest">
                  [CABINA ARCADE RETRO]
                </span>
                <span className="text-[10px] font-pixel px-2 py-0.5 rounded bg-arcade-purple/20 text-arcade-purple border border-arcade-purple/40">
                  {game.genreLabel}
                </span>
              </div>
              <h2 className="font-pixel text-base sm:text-lg text-white glow-gold uppercase">
                {game.title}
              </h2>
            </div>
          </div>

          {/* Top Actions: CRT, Insert Coin, Close */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleCrt}
              className={`p-2 rounded-xl border text-xs font-pixel transition-all flex items-center gap-1.5 ${
                isCrtOn
                  ? 'bg-arcade-cyan/20 border-arcade-cyan text-arcade-cyan shadow-neon-cyan'
                  : 'bg-arcade-dark border-slate-700 text-slate-400 hover:text-white'
              }`}
              title="Alternar filtro CRT Scanlines"
            >
              <Tv className="w-4 h-4" />
              <span className="hidden sm:inline text-[9px]">CRT</span>
            </button>

            <button
              onClick={onInsertCoin}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-arcade-gold/20 hover:bg-arcade-gold text-arcade-gold hover:text-black border border-arcade-gold/50 rounded-xl font-pixel text-[10px] transition-all shadow-neon-gold animate-pulse"
              title="Insertar Moneda (Tecla C)"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>COIN: {credits}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors border border-slate-700"
              title="Cerrar cabina (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector: Play vs Python Code */}
        <div className="flex border-b border-arcade-purple/30 bg-arcade-darker px-6 pt-2 gap-4">
          <button
            onClick={() => {
              setActiveTab('play');
              playHoverSound();
            }}
            className={`pb-2.5 font-pixel text-xs uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'play'
                ? 'border-arcade-cyan text-arcade-cyan glow-cyan'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            JUGAR EN PANTALLA
          </button>

          <button
            onClick={() => {
              setActiveTab('code');
              playHoverSound();
            }}
            className={`pb-2.5 font-pixel text-xs uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'code'
                ? 'border-arcade-purple text-arcade-purple glow-purple'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-4 h-4" />
            CÓDIGO PYTHON (PYGAME)
          </button>
        </div>

        {/* Main Cabinet Screen Viewport */}
        <div className={`p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-black/95 ${isCrtOn ? 'crt-effect' : ''}`}>
          {activeTab === 'play' ? (
            <div className="w-full flex flex-col items-center">
              {renderGameEngine()}
            </div>
          ) : (
            <div className="w-full h-full max-h-[600px]">
              <PythonCodeViewer gameTitle={game.title} pythonCode={game.pythonCode} />
            </div>
          )}
        </div>

        {/* Cabinet Bottom Control Bezel */}
        <div className="px-6 py-3.5 bg-gradient-to-r from-arcade-darker via-arcade-dark to-arcade-darker border-t-2 border-arcade-purple/40 flex items-center justify-between flex-wrap gap-2 text-xs font-pixel text-slate-400">
          <div className="flex items-center gap-4 text-[10px]">
            <span className="flex items-center gap-1.5 text-arcade-gold">
              <Sparkles className="w-3.5 h-3.5 text-arcade-gold" />
              DIFICULTAD: {game.difficulty}
            </span>
            <span className="hidden sm:inline text-arcade-cyan">
              JUGADORES: {game.players}
            </span>
            {sessionScore > 0 && (
              <span className="text-arcade-gold font-bold bg-black/60 px-2 py-0.5 rounded border border-arcade-gold/40">
                PUNTOS: {sessionScore}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[9px] text-slate-500 font-mono hidden md:inline">
              HOTKEYS: [P] Pausa • [R] Reiniciar • [C] Insert Coin
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-arcade-purple/20 hover:bg-arcade-purple text-purple-200 hover:text-white border border-arcade-purple/50 rounded-lg font-pixel text-[10px] transition-colors"
            >
              SALIR AL MENÚ
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
