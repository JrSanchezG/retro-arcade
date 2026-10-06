import React, { useRef } from 'react';
import type { ArcadeGame } from '../types';
import { GameCard } from './GameCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { playHoverSound } from '../utils/arcadeAudio';

interface GameCarouselProps {
  title: string;
  subtitle?: string;
  games: ArcadeGame[];
  onSelectGame: (game: ArcadeGame) => void;
  accentColor?: 'gold' | 'cyan' | 'purple';
}

export const GameCarousel: React.FC<GameCarouselProps> = ({
  title,
  subtitle,
  games,
  onSelectGame,
  accentColor = 'gold',
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scroll = (direction: 'left' | 'right') => {
    playHoverSound();
    if (scrollRef.current) {
      const offset = direction === 'left' ? -360 : 360;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  if (games.length === 0) return null;

  const getGlowColor = () => {
    switch (accentColor) {
      case 'cyan': return 'text-arcade-cyan glow-cyan';
      case 'purple': return 'text-arcade-purple glow-purple';
      case 'gold':
      default: return 'text-arcade-gold glow-gold';
    }
  };

  return (
    <section className="my-8 relative">
      {/* Carousel Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-6 bg-arcade-gold rounded-xs shadow-neon-gold" />
          <div>
            <h2 className={`font-pixel text-base sm:text-lg uppercase tracking-wider ${getGlowColor()}`}>
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {subtitle} ({games.length} títulos)
              </p>
            )}
          </div>
        </div>

        {/* Carousel Arrow Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-xl bg-arcade-dark border border-slate-700 hover:border-arcade-gold text-slate-400 hover:text-arcade-gold transition-all active:scale-95 shadow-xs"
            title="Desplazar a la izquierda"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-xl bg-arcade-dark border border-slate-700 hover:border-arcade-gold text-slate-400 hover:text-arcade-gold transition-all active:scale-95 shadow-xs"
            title="Desplazar a la derecha"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 px-2 no-scrollbar scroll-smooth"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {games.map(game => (
          <div
            key={game.id}
            className="w-[280px] sm:w-[320px] shrink-0"
            style={{ scrollSnapAlign: 'start' }}
          >
            <GameCard game={game} onSelectGame={onSelectGame} />
          </div>
        ))}
      </div>
    </section>
  );
};
