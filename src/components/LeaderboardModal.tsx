import React from 'react';
import { Trophy, X, Medal } from 'lucide-react';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ScoreEntry {
  rank: number;
  initials: string;
  game: string;
  score: number;
  date: string;
}

const HIGH_SCORES: ScoreEntry[] = [
  { rank: 1, initials: 'JRS', game: 'Tetris Pixel Blocks', score: 18450, date: '198X-10' },
  { rank: 2, initials: 'SNC', game: 'Galactic Defense', score: 4920, date: '198X-09' },
  { rank: 3, initials: 'JRS', game: 'Blockbreaker Neon', score: 3850, date: '198X-08' },
  { rank: 4, initials: 'NEO', game: 'Neon Snake 1997', score: 1420, date: '198X-07' },
  { rank: 5, initials: 'JRS', game: 'Pinpon Cyber 1982', score: 11, date: '198X-06' },
  { rank: 6, initials: 'CYB', game: 'Tetris Pixel Blocks', score: 14200, date: '198X-05' },
  { rank: 7, initials: '8BT', game: 'Blockbreaker Neon', score: 2900, date: '198X-04' },
  { rank: 8, initials: 'ARC', game: 'Galactic Defense', score: 2650, date: '198X-03' },
];

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-arcade-darkest border-4 border-arcade-gold/80 rounded-3xl shadow-[0_0_50px_rgba(255,215,0,0.3)] overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-arcade-darkpurple via-arcade-dark to-arcade-darkpurple border-b border-arcade-gold/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-arcade-gold/20 text-arcade-gold border border-arcade-gold/50 shadow-neon-gold">
              <Trophy className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="font-pixel text-[9px] text-arcade-cyan uppercase tracking-widest block">
                [SALÓN DE LA FAMA]
              </span>
              <h3 className="font-pixel text-base sm:text-lg text-white glow-gold">
                HALL OF FAME • RECORDS
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* High Scores List */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh] space-y-2 font-pixel">
          <div className="grid grid-cols-12 text-[10px] text-arcade-cyan pb-2 border-b border-slate-800 uppercase">
            <span className="col-span-2">POS</span>
            <span className="col-span-3">JUGADOR</span>
            <span className="col-span-4">JUEGO</span>
            <span className="col-span-3 text-right">PUNTOS</span>
          </div>

          {HIGH_SCORES.map(entry => (
            <div
              key={entry.rank}
              className={`grid grid-cols-12 items-center text-xs py-2 px-2 rounded-lg transition-colors ${
                entry.rank === 1
                  ? 'bg-arcade-gold/15 text-arcade-gold border border-arcade-gold/40'
                  : entry.rank === 2
                  ? 'bg-arcade-cyan/10 text-arcade-cyan border border-arcade-cyan/30'
                  : entry.rank === 3
                  ? 'bg-arcade-purple/10 text-arcade-purple border border-arcade-purple/30'
                  : 'text-slate-300 hover:bg-slate-900/50'
              }`}
            >
              <span className="col-span-2 flex items-center gap-1 font-bold">
                {entry.rank <= 3 && <Medal className="w-3.5 h-3.5" />}
                #{entry.rank}
              </span>
              <span className="col-span-3 font-black tracking-widest text-white">
                {entry.initials}
              </span>
              <span className="col-span-4 text-[10px] text-slate-400 truncate">
                {entry.game}
              </span>
              <span className="col-span-3 text-right font-bold font-mono">
                {entry.score.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-arcade-darker border-t border-slate-800 flex items-center justify-between text-[10px] font-pixel text-slate-400">
          <span>TUS SCORES SE GUARDAN EN LOCAL</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-arcade-gold text-black font-bold hover:bg-yellow-400 transition-colors"
          >
            CERRAR
          </button>
        </div>

      </div>
    </div>
  );
};
