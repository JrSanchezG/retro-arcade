import React, { useEffect, useRef, useState, useCallback } from 'react';
import { playScoreSound, playGameOverSound } from '../../utils/arcadeAudio';
import { RotateCcw, Play, Pause } from 'lucide-react';

interface SnakeGameProps {
  onScoreUpdate?: (score: number) => void;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

interface Position {
  x: number;
  y: number;
}

export const SnakeGame: React.FC<SnakeGameProps> = ({ onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const GRID_SIZE = 20;
  const CELL_COUNT = 24; // 480x480 canvas

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      return Number(localStorage.getItem('arcade_snake_hs') || 1420);
    } catch {
      return 1420;
    }
  });
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Snake State in refs for high-frequency tick loop
  const snakeRef = useRef<Position[]>([
    { x: 10, y: 12 },
    { x: 9, y: 12 },
    { x: 8, y: 12 }
  ]);
  const directionRef = useRef<Direction>('RIGHT');
  const nextDirectionRef = useRef<Direction>('RIGHT');
  const foodRef = useRef<Position>({ x: 16, y: 12 });
  const goldenAppleRef = useRef<Position | null>(null);
  const goldenTimerRef = useRef<number>(0);
  const scoreRef = useRef(0);
  const speedRef = useRef(110); // ms per step

  const spawnFood = useCallback(() => {
    let newPos: Position;
    while (true) {
      newPos = {
        x: Math.floor(Math.random() * CELL_COUNT),
        y: Math.floor(Math.random() * CELL_COUNT)
      };
      const onSnake = snakeRef.current.some(s => s.x === newPos.x && s.y === newPos.y);
      if (!onSnake) break;
    }
    foodRef.current = newPos;

    // Chance to spawn golden apple (25% chance)
    if (Math.random() < 0.25 && !goldenAppleRef.current) {
      let goldPos: Position;
      while (true) {
        goldPos = {
          x: Math.floor(Math.random() * CELL_COUNT),
          y: Math.floor(Math.random() * CELL_COUNT)
        };
        const onSnake = snakeRef.current.some(s => s.x === goldPos.x && s.y === goldPos.y);
        const onFood = foodRef.current.x === goldPos.x && foodRef.current.y === goldPos.y;
        if (!onSnake && !onFood) break;
      }
      goldenAppleRef.current = goldPos;
      goldenTimerRef.current = 60; // 60 ticks before disappearing
    }
  }, [CELL_COUNT]);

  const resetGame = () => {
    snakeRef.current = [
      { x: 10, y: 12 },
      { x: 9, y: 12 },
      { x: 8, y: 12 }
    ];
    directionRef.current = 'RIGHT';
    nextDirectionRef.current = 'RIGHT';
    scoreRef.current = 0;
    speedRef.current = 110;
    goldenAppleRef.current = null;
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    spawnFood();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      if (e.key === 'p' || e.key === 'P') {
        setIsPaused(prev => !prev);
        return;
      }

      if (e.key === 'r' || e.key === 'R') {
        resetGame();
        return;
      }

      if (gameOver && e.code === 'Space') {
        resetGame();
        return;
      }

      const cur = directionRef.current;
      if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') && cur !== 'DOWN') {
        nextDirectionRef.current = 'UP';
      } else if ((e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') && cur !== 'UP') {
        nextDirectionRef.current = 'DOWN';
      } else if ((e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') && cur !== 'RIGHT') {
        nextDirectionRef.current = 'LEFT';
      } else if ((e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') && cur !== 'LEFT') {
        nextDirectionRef.current = 'RIGHT';
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver]);

  // Main game tick loop
  useEffect(() => {
    if (gameOver || isPaused) return;

    const interval = setInterval(() => {
      const head = { ...snakeRef.current[0] };
      directionRef.current = nextDirectionRef.current;

      switch (directionRef.current) {
        case 'UP': head.y -= 1; break;
        case 'DOWN': head.y += 1; break;
        case 'LEFT': head.x -= 1; break;
        case 'RIGHT': head.x += 1; break;
      }

      // Check wall collision
      if (head.x < 0 || head.x >= CELL_COUNT || head.y < 0 || head.y >= CELL_COUNT) {
        playGameOverSound();
        setGameOver(true);
        return;
      }

      // Check self collision
      if (snakeRef.current.some(seg => seg.x === head.x && seg.y === head.y)) {
        playGameOverSound();
        setGameOver(true);
        return;
      }

      const newSnake = [head, ...snakeRef.current];

      // Check regular food
      if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
        playScoreSound();
        scoreRef.current += 10;
        setScore(scoreRef.current);
        onScoreUpdate?.(scoreRef.current);

        if (scoreRef.current > highScore) {
          setHighScore(scoreRef.current);
          try {
            localStorage.setItem('arcade_snake_hs', String(scoreRef.current));
          } catch {
            // fallback
          }
        }

        // Increase speed slightly
        speedRef.current = Math.max(55, speedRef.current - 2);
        spawnFood();
      } else if (
        goldenAppleRef.current &&
        head.x === goldenAppleRef.current.x &&
        head.y === goldenAppleRef.current.y
      ) {
        // Golden bonus
        playScoreSound();
        scoreRef.current += 50;
        setScore(scoreRef.current);
        onScoreUpdate?.(scoreRef.current);
        goldenAppleRef.current = null;
      } else {
        newSnake.pop();
      }

      // Golden apple timer countdown
      if (goldenAppleRef.current) {
        goldenTimerRef.current -= 1;
        if (goldenTimerRef.current <= 0) {
          goldenAppleRef.current = null;
        }
      }

      snakeRef.current = newSnake;
    }, speedRef.current);

    return () => clearInterval(interval);
  }, [gameOver, isPaused, CELL_COUNT, highScore, onScoreUpdate, spawnFood]);

  // Canvas Renderer (60 FPS)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      // Background Grid
      ctx.fillStyle = '#05020a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle pixel grid pattern
      ctx.strokeStyle = '#120b22';
      ctx.lineWidth = 1;
      for (let i = 0; i <= CELL_COUNT; i++) {
        ctx.beginPath();
        ctx.moveTo(i * GRID_SIZE, 0);
        ctx.lineTo(i * GRID_SIZE, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * GRID_SIZE);
        ctx.lineTo(canvas.width, i * GRID_SIZE);
        ctx.stroke();
      }

      // Draw regular food (Glowing Cyan Apple)
      const food = foodRef.current;
      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 10;
      ctx.fillRect(food.x * GRID_SIZE + 2, food.y * GRID_SIZE + 2, GRID_SIZE - 4, GRID_SIZE - 4);

      // Draw Golden Bonus Apple (if active)
      if (goldenAppleRef.current) {
        const gold = goldenAppleRef.current;
        ctx.fillStyle = '#ffd700';
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 16;
        ctx.fillRect(gold.x * GRID_SIZE + 1, gold.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);
      }

      // Reset shadow
      ctx.shadowBlur = 0;

      // Draw Snake
      snakeRef.current.forEach((seg, idx) => {
        if (idx === 0) {
          // Head (Bright Cyan with golden eyes)
          ctx.fillStyle = '#38bdf8';
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 8;
          ctx.fillRect(seg.x * GRID_SIZE + 1, seg.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);
          ctx.shadowBlur = 0;

          // Eye pixels
          ctx.fillStyle = '#ffd700';
          if (directionRef.current === 'RIGHT') {
            ctx.fillRect(seg.x * GRID_SIZE + 14, seg.y * GRID_SIZE + 4, 3, 3);
            ctx.fillRect(seg.x * GRID_SIZE + 14, seg.y * GRID_SIZE + 13, 3, 3);
          } else if (directionRef.current === 'LEFT') {
            ctx.fillRect(seg.x * GRID_SIZE + 3, seg.y * GRID_SIZE + 4, 3, 3);
            ctx.fillRect(seg.x * GRID_SIZE + 3, seg.y * GRID_SIZE + 13, 3, 3);
          } else if (directionRef.current === 'UP') {
            ctx.fillRect(seg.x * GRID_SIZE + 4, seg.y * GRID_SIZE + 3, 3, 3);
            ctx.fillRect(seg.x * GRID_SIZE + 13, seg.y * GRID_SIZE + 3, 3, 3);
          } else {
            ctx.fillRect(seg.x * GRID_SIZE + 4, seg.y * GRID_SIZE + 14, 3, 3);
            ctx.fillRect(seg.x * GRID_SIZE + 13, seg.y * GRID_SIZE + 14, 3, 3);
          }
        } else {
          // Body segments with fading cyan/purple gradient effect
          const isAlternate = idx % 2 === 0;
          ctx.fillStyle = isAlternate ? '#0284c7' : '#8b5cf6';
          ctx.fillRect(seg.x * GRID_SIZE + 2, seg.y * GRID_SIZE + 2, GRID_SIZE - 4, GRID_SIZE - 4);
        }
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [GRID_SIZE, CELL_COUNT]);

  return (
    <div className="flex flex-col items-center">
      {/* Top HUD Bar */}
      <div className="w-full max-w-[480px] mb-3 flex items-center justify-between px-3 py-2 bg-arcade-dark border border-arcade-cyan/30 rounded-xl font-pixel text-xs text-arcade-cyan">
        <div className="flex items-center gap-2">
          <span className="text-arcade-gold">SCORE:</span>
          <span className="text-white font-bold">{score}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-arcade-purple">HI:</span>
          <span className="text-arcade-gold font-bold">{highScore}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsPaused(p => !p)}
            className="p-1 hover:text-arcade-gold transition-colors"
            title="Pausa (P)"
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={resetGame}
            className="p-1 hover:text-arcade-gold transition-colors"
            title="Reiniciar (R)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Screen Frame */}
      <div className="relative border-4 border-arcade-cyan/60 rounded-xl shadow-neon-cyan crt-bloom overflow-hidden bg-black">
        <canvas
          ref={canvasRef}
          width={480}
          height={480}
          className="block w-full max-w-[480px] h-auto aspect-square"
        />

        {/* Game Over Screen */}
        {gameOver && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center z-30 animate-fade-in">
            <h3 className="font-pixel text-2xl text-red-500 mb-2 glow-gold">GAME OVER</h3>
            <p className="font-pixel text-xs text-arcade-gold mb-1">SCORE FINAL: {score}</p>
            {score >= highScore && score > 0 && (
              <p className="font-pixel text-[10px] text-arcade-cyan mb-4 animate-bounce">
                ¡NUEVO RECORD HISTÓRICO!
              </p>
            )}
            <button
              onClick={resetGame}
              className="mt-4 px-5 py-2.5 bg-arcade-gold text-black font-pixel text-xs rounded hover:bg-yellow-400 transition-all shadow-neon-gold flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              INSERT COIN / JUGAR DE NUEVO
            </button>
          </div>
        )}

        {/* Paused Screen */}
        {isPaused && !gameOver && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-30">
            <h3 className="font-pixel text-xl text-arcade-cyan animate-pulse">PAUSA</h3>
            <p className="font-pixel text-[9px] text-slate-400 mt-2">Presiona P para continuar</p>
          </div>
        )}
      </div>

      {/* On-Screen Mobile D-Pad */}
      <div className="mt-4 grid grid-cols-3 gap-2 w-48 sm:hidden">
        <div />
        <button
          onClick={() => { if (directionRef.current !== 'DOWN') nextDirectionRef.current = 'UP'; }}
          className="p-3 bg-arcade-panel border border-arcade-cyan/40 text-arcade-cyan rounded font-pixel text-sm active:bg-arcade-cyan active:text-black"
        >
          ▲
        </button>
        <div />
        <button
          onClick={() => { if (directionRef.current !== 'RIGHT') nextDirectionRef.current = 'LEFT'; }}
          className="p-3 bg-arcade-panel border border-arcade-cyan/40 text-arcade-cyan rounded font-pixel text-sm active:bg-arcade-cyan active:text-black"
        >
          ◀
        </button>
        <button
          onClick={() => { if (directionRef.current !== 'UP') nextDirectionRef.current = 'DOWN'; }}
          className="p-3 bg-arcade-panel border border-arcade-cyan/40 text-arcade-cyan rounded font-pixel text-sm active:bg-arcade-cyan active:text-black"
        >
          ▼
        </button>
        <button
          onClick={() => { if (directionRef.current !== 'LEFT') nextDirectionRef.current = 'RIGHT'; }}
          className="p-3 bg-arcade-panel border border-arcade-cyan/40 text-arcade-cyan rounded font-pixel text-sm active:bg-arcade-cyan active:text-black"
        >
          ▶
        </button>
      </div>
    </div>
  );
};
