import React, { useState } from 'react';
import { Copy, Check, Terminal, Download } from 'lucide-react';
import { playScoreSound } from '../utils/arcadeAudio';

interface PythonCodeViewerProps {
  gameTitle: string;
  pythonCode: string;
}

export const PythonCodeViewer: React.FC<PythonCodeViewerProps> = ({ gameTitle, pythonCode }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(pythonCode);
    setCopied(true);
    playScoreSound();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([pythonCode], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${gameTitle.toLowerCase().replace(/\s+/g, '_')}_arcade.py`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    playScoreSound();
  };

  return (
    <div className="flex flex-col h-full bg-[#080511] border border-arcade-purple/40 rounded-xl overflow-hidden font-mono text-xs">
      {/* Code Viewer Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-arcade-dark border-b border-arcade-purple/30">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-arcade-gold" />
          <span className="font-pixel text-[11px] text-white">
            {gameTitle} <span className="text-arcade-cyan font-sans">(Script Python / Pygame)</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-arcade-surface hover:bg-arcade-panel border border-slate-700 text-slate-300 hover:text-white transition-colors text-[10px]"
            title="Descargar script .py"
          >
            <Download className="w-3.5 h-3.5 text-arcade-cyan" />
            <span>Descargar .py</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-arcade-purple/20 hover:bg-arcade-purple text-purple-200 hover:text-white border border-arcade-purple/50 transition-all text-[10px]"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">¡COPIADO!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-arcade-gold" />
                <span>Copiar Código</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Terminal Quick Instructions */}
      <div className="px-4 py-2 bg-black/60 border-b border-slate-900 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-arcade-gold font-bold">$</span>
          <span>pip install pygame</span>
          <span className="text-slate-600">&&</span>
          <span>python game.py</span>
        </div>
        <span className="text-[10px] text-arcade-cyan hidden sm:inline">100% Funcional en PC / Mac / Linux</span>
      </div>

      {/* Code Text Area */}
      <div className="flex-1 overflow-auto p-4 max-h-[520px] bg-[#05020a]">
        <pre className="text-slate-200 leading-relaxed font-mono select-text">
          <code>
            {pythonCode.split('\n').map((line, idx) => {
              const isComment = line.trim().startsWith('#');
              const isImport = line.trim().startsWith('import') || line.trim().startsWith('from');
              const isDefOrClass = line.trim().startsWith('def ') || line.trim().startsWith('class ');
              return (
                <div key={idx} className="flex">
                  <span className="w-10 select-none text-slate-600 text-right pr-4 shrink-0 font-pixel text-[9px] pt-0.5">
                    {idx + 1}
                  </span>
                  <span
                    className={
                      isComment
                        ? 'text-emerald-400 italic'
                        : isImport
                        ? 'text-arcade-purple font-semibold'
                        : isDefOrClass
                        ? 'text-arcade-gold font-bold'
                        : line.includes('pygame.')
                        ? 'text-arcade-cyan'
                        : 'text-slate-300'
                    }
                  >
                    {line}
                  </span>
                </div>
              );
            })}
          </code>
        </pre>
      </div>
    </div>
  );
};
