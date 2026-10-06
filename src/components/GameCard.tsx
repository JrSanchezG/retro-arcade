import React, { useRef, useState } from 'react';
import type { ArcadeGame } from '../types';
import { Play, Trophy, Users, Terminal } from 'lucide-react';
import { playHoverSound, playGameStartSound } from '../utils/arcadeAudio';

interface GameCardProps {
  game: ArcadeGame;
  onSelectGame: (game: ArcadeGame) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onSelectGame }) => {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    playHoverSound();
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay blocked fallback handled silently
        });
      }
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleClick = () => {
    playGameStartSound();
    onSelectGame(game);
  };

  const getAccentBorder = () => {
    switch (game.accentColor) {
      case 'gold':
        return isHovered ? 'border-arcade-gold shadow-neon-gold' : 'border-arcade-gold/40 hover:border-arcade-gold';
      case 'purple':
        return isHovered ? 'border-arcade-purple shadow-neon-purple' : 'border-arcade-purple/40 hover:border-arcade-purple';
      case 'cyan':
      default:
        return isHovered ? 'border-arcade-cyan shadow-neon-cyan' : 'border-arcade-cyan/40 hover:border-arcade-cyan';
    }
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={`group relative bg-arcade-dark border-2 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 transform ${
        isHovered ? 'scale-[1.03] -translate-y-1.5' : 'hover:-translate-y-1'
      } ${getAccentBorder()} flex flex-col justify-between`}
    >
      {/* Visual Preview Container (Video on Hover / Poster Image) */}
      <div className="relative w-full aspect-[16/10] bg-black overflow-hidden crt-effect">
        {/* Cover Poster Image */}
        <img
          src={game.coverImage}
          alt={game.title}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isHovered ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {/* Hover Gameplay Video Loop */}
        <video
          ref={videoRef}
          src={game.previewVideo}
          loop
          muted
          playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Scanline and dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-arcade-dark via-transparent to-black/40 pointer-events-none" />

        {/* Top Badges: Year & Genre */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
          <span className="font-pixel text-[9px] px-2 py-0.5 rounded bg-black/80 text-arcade-gold border border-arcade-gold/40 shadow-xs">
            {game.year}
          </span>
          <span className="font-pixel text-[9px] px-2 py-0.5 rounded bg-black/80 text-arcade-cyan border border-arcade-cyan/40 shadow-xs">
            {game.genreLabel}
          </span>
        </div>

        {/* Hover Blinking Indicator: "PRESS START" */}
        {isHovered && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className="px-3 py-1.5 rounded-lg bg-black/85 border-2 border-arcade-gold shadow-neon-gold animate-blink-fast flex items-center gap-2">
              <Play className="w-3.5 h-3.5 text-arcade-gold fill-arcade-gold" />
              <span className="font-pixel text-[10px] text-arcade-gold tracking-widest font-black">
                CLICK PARA JUGAR
              </span>
            </div>
          </div>
        )}

        {/* High Score Badge at bottom-right */}
        <div className="absolute bottom-2 right-2.5 z-10 flex items-center gap-1 bg-black/80 px-2 py-0.5 rounded text-[9px] font-pixel text-arcade-gold border border-arcade-gold/30">
          <Trophy className="w-3 h-3 text-amber-400" />
          <span>HI: {game.highScore}</span>
        </div>
      </div>

      {/* Card Body Information */}
      <div className="p-4 flex flex-col justify-between flex-1 space-y-3 bg-gradient-to-b from-arcade-dark to-arcade-darker">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-pixel text-sm sm:text-base text-white group-hover:text-arcade-gold transition-colors truncate">
              {game.title}
            </h3>
            <span className="text-[10px] text-amber-400 font-pixel flex items-center">
              ★ {game.rating}
            </span>
          </div>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {game.tagline}
          </p>
        </div>

        {/* Footer Meta & Button */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-pixel text-slate-400">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-slate-300">
              <Users className="w-3.5 h-3.5 text-arcade-purple" />
              {game.players}
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <Terminal className="w-3 h-3 text-emerald-400" />
              Python
            </span>
          </div>

          <span className="text-[9px] text-arcade-cyan group-hover:text-arcade-gold transition-colors font-bold uppercase tracking-wider">
            INSERT COIN ◄
          </span>
        </div>
      </div>
    </div>
  );
};
