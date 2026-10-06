import React from 'react';
import { Gamepad2, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 bg-arcade-darkest border-t-2 border-arcade-purple/40 py-8 px-4 text-xs font-pixel text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand & Developer Note */}
        <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-arcade-gold" />
            <span className="text-white text-sm">ARCADE VAULT • RETRO EDITION</span>
          </div>
          <p className="text-slate-500 font-mono text-xs">
            Desarrollado para el portafolio de <strong className="text-arcade-cyan font-sans">Junior Sánchez</strong>.
            Juegos 100% jugables en navegador y proyectos en Python / Pygame.
          </p>
        </div>

        {/* Hotkeys Legend */}
        <div className="p-3 rounded-xl bg-arcade-dark border border-slate-800 text-[10px] space-y-1 text-center md:text-left">
          <span className="text-arcade-gold block font-bold">// ATAJOS DE TECLADO:</span>
          <div className="flex flex-wrap gap-2 text-slate-400 font-mono">
            <span className="px-1.5 py-0.5 rounded bg-black text-arcade-cyan">[C] Moneda</span>
            <span className="px-1.5 py-0.5 rounded bg-black text-arcade-purple">[P] Pausa</span>
            <span className="px-1.5 py-0.5 rounded bg-black text-amber-400">[R] Reiniciar</span>
            <span className="px-1.5 py-0.5 rounded bg-black text-slate-300">[ESC] Menú</span>
          </div>
        </div>

        {/* Portfolio Link */}
        <div className="flex items-center gap-3">
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-arcade-surface hover:bg-arcade-panel border border-arcade-cyan/40 text-arcade-cyan hover:text-white transition-all shadow-xs text-[10px]"
          >
            <span>Ver Portafolio Principal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </footer>
  );
};
