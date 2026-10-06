import React, { useEffect, useRef, useState, useCallback } from 'react';
import { playHitSound, playScoreSound, playGameOverSound } from '../../utils/arcadeAudio';
import { RotateCcw, Heart, Play, Pause } from 'lucide-react';

interface BlockbreakerGameProps {
  onScoreUpdate?: (score: number) => void;
}

interface Brick {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  points: number;
  hitsRequired: number;
  hitsLeft: number;
}

export const BlockbreakerGame: React.FC<BlockbreakerGameProps> = ({ onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const WIDTH = 600;
  const HEIGHT = 500;
  const PADDLE_W = 96;
  const PADDLE_H = 14;
  const BALL_RADIUS = 7;

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      return Number(localStorage.getItem('arcade_breakout_hs') || 3850);
    } catch {
      return 3850;
    }
  });
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Mutable game refs
  const paddleX = useRef(WIDTH / 2 - PADDLE_W / 2);
  const ballX = useRef(WIDTH / 2);
  const ballY = useRef(HEIGHT - 60);
  const ballDX = useRef(4);
  const ballDY = useRef(-5);
  const ballAttached = useRef(true);
  const bricksRef = useRef<Brick[]>([]);
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const scoreRef = useRef(0);

  const generateBricks = useCallback(() => {
    const rows = 5;
    const cols = 9;
    const brickW = 56;
    const brickH = 20;
    const padX = 38;
    const padY = 50;

    const list: Brick[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let color = '#00f0ff';
        let pts = 30;
        let hits = 1;

        if (r === 0) {
          color = '#ffd700'; // Gold
          pts = 80;
          hits = 2;
        } else if (r === 1 || r === 2) {
          color = '#a855f7'; // Purple
          pts = 50;
          hits = 1;
        }

        list.push({
          x: padX + c * (brickW + 4),
          y: padY + r * (brickH + 6),
          w: brickW,
          h: brickH,
          color,
          points: pts,
          hitsRequired: hits,
          hitsLeft: hits,
        });
      }
    }
    bricksRef.current = list;
  }, []);

  const resetBall = () => {
    ballAttached.current = true;
    ballX.current = paddleX.current + PADDLE_W / 2;
    ballY.current = HEIGHT - 45 - BALL_RADIUS;
    ballDX.current = 4;
    ballDY.current = -5;
  };

  const restartGame = () => {
    paddleX.current = WIDTH / 2 - PADDLE_W / 2;
    setLives(3);
    setScore(0);
    scoreRef.current = 0;
    setGameOver(false);
    setGameWon(false);
    setIsPaused(false);
    generateBricks();
    resetBall();
  };

  // Keyboard and mouse handlers
  useEffect(() => {
    generateBricks();
    resetBall();

    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = true;

      if (['ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      if (e.code === 'Space' && ballAttached.current) {
        ballAttached.current = false;
        playHitSound(1.2);
      }

      if (e.key === 'p' || e.key === 'P') {
        setIsPaused(prev => !prev);
      }

      if (e.key === 'r' || e.key === 'R') {
        restartGame();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * WIDTH;
      paddleX.current = Math.max(0, Math.min(WIDTH - PADDLE_W, mouseX - PADDLE_W / 2));
      if (ballAttached.current) {
        ballX.current = paddleX.current + PADDLE_W / 2;
      }
    };

    const canvas = canvasRef.current;
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas?.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas?.removeEventListener('mousemove', handleMouseMove);
    };
  }, [generateBricks]);

  // Main Game Loop (60 FPS)
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      if (!isPaused && !gameOver && !gameWon) {
        // Paddle movement with keys
        if ((keysPressed.current['ArrowLeft'] || keysPressed.current['a'] || keysPressed.current['A']) && paddleX.current > 0) {
          paddleX.current -= 8;
        }
        if ((keysPressed.current['ArrowRight'] || keysPressed.current['d'] || keysPressed.current['D']) && paddleX.current < WIDTH - PADDLE_W) {
          paddleX.current += 8;
        }

        // If ball is attached to paddle before launch
        if (ballAttached.current) {
          ballX.current = paddleX.current + PADDLE_W / 2;
          ballY.current = HEIGHT - 40 - BALL_RADIUS;
        } else {
          // Ball movement
          ballX.current += ballDX.current;
          ballY.current += ballDY.current;

          // Wall collision (Left / Right)
          if (ballX.current - BALL_RADIUS <= 0) {
            ballX.current = BALL_RADIUS;
            ballDX.current = Math.abs(ballDX.current);
            playHitSound(1.2);
          } else if (ballX.current + BALL_RADIUS >= WIDTH) {
            ballX.current = WIDTH - BALL_RADIUS;
            ballDX.current = -Math.abs(ballDX.current);
            playHitSound(1.2);
          }

          // Ceiling collision
          if (ballY.current - BALL_RADIUS <= 0) {
            ballY.current = BALL_RADIUS;
            ballDY.current = Math.abs(ballDY.current);
            playHitSound(1.2);
          }

          // Paddle collision
          const paddleTop = HEIGHT - 40;
          if (
            ballY.current + BALL_RADIUS >= paddleTop &&
            ballY.current - BALL_RADIUS <= paddleTop + PADDLE_H &&
            ballX.current >= paddleX.current &&
            ballX.current <= paddleX.current + PADDLE_W &&
            ballDY.current > 0
          ) {
            // Angle based on hit location
            const hitPoint = (ballX.current - (paddleX.current + PADDLE_W / 2)) / (PADDLE_W / 2);
            ballDX.current = hitPoint * 7;
            ballDY.current = -Math.max(4, Math.sqrt(49 - ballDX.current * ballDX.current));
            playHitSound(1.6);
          }

          // Brick collisions
          for (let i = 0; i < bricksRef.current.length; i++) {
            const b = bricksRef.current[i];
            if (
              ballX.current + BALL_RADIUS >= b.x &&
              ballX.current - BALL_RADIUS <= b.x + b.w &&
              ballY.current + BALL_RADIUS >= b.y &&
              ballY.current - BALL_RADIUS <= b.y + b.h
            ) {
              b.hitsLeft -= 1;
              if (b.hitsLeft <= 0) {
                bricksRef.current.splice(i, 1);
                scoreRef.current += b.points;
                setScore(scoreRef.current);
                onScoreUpdate?.(scoreRef.current);

                if (scoreRef.current > highScore) {
                  setHighScore(scoreRef.current);
                  try {
                    localStorage.setItem('arcade_breakout_hs', String(scoreRef.current));
                  } catch {
                    // fallback
                  }
                }
              }

              // Invert Y direction
              ballDY.current = -ballDY.current;
              playScoreSound();
              break;
            }
          }

          // Check if all bricks cleared (Victory!)
          if (bricksRef.current.length === 0) {
            setGameWon(true);
            playScoreSound();
          }

          // Bottom fell out (Life lost)
          if (ballY.current - BALL_RADIUS > HEIGHT) {
            playGameOverSound();
            setLives(prev => {
              const next = prev - 1;
              if (next <= 0) {
                setGameOver(true);
              } else {
                resetBall();
              }
              return next;
            });
          }
        }
      }

      // --- Render Scene ---
      ctx.fillStyle = '#05020a';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // Draw Bricks
      bricksRef.current.forEach(b => {
        ctx.fillStyle = b.color;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = b.hitsLeft > 1 ? 12 : 6;
        ctx.fillRect(b.x, b.y, b.w, b.h);

        // Brick 3D retro highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.fillRect(b.x, b.y, b.w, 3);
      });
      ctx.shadowBlur = 0;

      // Draw Paddle
      ctx.fillStyle = '#a855f7';
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 10;
      ctx.fillRect(paddleX.current, HEIGHT - 40, PADDLE_W, PADDLE_H);

      // Paddle neon center stripe
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(paddleX.current + 8, HEIGHT - 36, PADDLE_W - 16, 6);
      ctx.shadowBlur = 0;

      // Draw Ball
      ctx.fillStyle = '#ffd700';
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(ballX.current, ballY.current, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw instructions if ball attached
      if (ballAttached.current && !gameOver && !gameWon) {
        ctx.font = '11px "Press Start 2P", monospace';
        ctx.fillStyle = '#ffd700';
        ctx.textAlign = 'center';
        ctx.fillText('PRESIONA ESPACIO PARA LANZAR', WIDTH / 2, HEIGHT - 80);
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, gameOver, gameWon, highScore, onScoreUpdate]);

  return (
    <div className="flex flex-col items-center">
      {/* Top HUD */}
      <div className="w-full max-w-[600px] mb-3 flex items-center justify-between px-4 py-2.5 bg-arcade-dark border border-arcade-purple/40 rounded-xl font-pixel text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-arcade-gold">SCORE:</span>
            <span className="text-white font-bold">{score}</span>
          </div>
          <div className="flex items-center gap-1 text-red-500">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                className={`w-4 h-4 ${i < lives ? 'fill-red-500 text-red-500' : 'text-slate-700'}`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1 text-[10px] text-arcade-purple">
            <span>HI:</span>
            <span className="text-arcade-gold font-bold">{highScore}</span>
          </div>
          <button
            onClick={() => setIsPaused(p => !p)}
            className="p-1 text-arcade-cyan hover:text-white transition-colors"
            title="Pausa (P)"
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
          <button
            onClick={restartGame}
            className="p-1 text-arcade-gold hover:text-white transition-colors"
            title="Reiniciar (R)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Screen Frame */}
      <div className="relative border-4 border-arcade-purple/60 rounded-xl shadow-neon-purple crt-bloom overflow-hidden bg-black">
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          className="block w-full max-w-[600px] h-auto aspect-[6/5] cursor-none"
        />

        {/* Game Over Screen */}
        {gameOver && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center z-30">
            <h3 className="font-pixel text-2xl text-red-500 mb-2 glow-gold">GAME OVER</h3>
            <p className="font-pixel text-xs text-arcade-gold mb-1">SCORE: {score}</p>
            <button
              onClick={restartGame}
              className="mt-4 px-5 py-2.5 bg-arcade-gold text-black font-pixel text-xs rounded hover:bg-yellow-400 transition-all shadow-neon-gold flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              INSERT COIN / JUGAR DE NUEVO
            </button>
          </div>
        )}

        {/* Victory Screen */}
        {gameWon && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center z-30">
            <h3 className="font-pixel text-2xl text-arcade-gold mb-2 glow-gold">¡NIVEL COMPLETADO!</h3>
            <p className="font-pixel text-xs text-arcade-cyan mb-1">¡HAS DESTRUIDO TODOS LOS BLOQUES!</p>
            <p className="font-pixel text-sm text-white mb-4">PUNTOS: {score}</p>
            <button
              onClick={restartGame}
              className="px-5 py-2.5 bg-arcade-purple text-white font-pixel text-xs rounded hover:bg-purple-600 transition-all shadow-neon-purple flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              JUGAR OTRA VEZ
            </button>
          </div>
        )}

        {/* Paused Screen */}
        {isPaused && !gameOver && !gameWon && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-30">
            <h3 className="font-pixel text-xl text-arcade-purple animate-pulse">PAUSA</h3>
            <p className="font-pixel text-[9px] text-slate-400 mt-2">Presiona P para continuar</p>
          </div>
        )}
      </div>

      <div className="mt-3 text-center text-[10px] font-pixel text-slate-500">
        Controla con el Ratón o las teclas [← / →]. Espacio para soltar la bola.
      </div>
    </div>
  );
};
