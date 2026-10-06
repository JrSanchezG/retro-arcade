import React, { useEffect, useRef, useState } from 'react';
import { playHitSound, playScoreSound, playGameOverSound } from '../../utils/arcadeAudio';
import { RotateCcw, Users, User, Play, Pause } from 'lucide-react';

interface PongGameProps {
  onScoreUpdate?: (score: number) => void;
}

export const PongGame: React.FC<PongGameProps> = ({ onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const WIDTH = 640;
  const HEIGHT = 420;
  const PADDLE_W = 12;
  const PADDLE_H = 75;
  const BALL_SIZE = 12;
  const WINNING_SCORE = 7;

  const [mode, setMode] = useState<'1P' | '2P'>('1P');
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Mutable game state in refs
  const p1Y = useRef(HEIGHT / 2 - PADDLE_H / 2);
  const p2Y = useRef(HEIGHT / 2 - PADDLE_H / 2);
  const ballX = useRef(WIDTH / 2);
  const ballY = useRef(HEIGHT / 2);
  const ballSpeedX = useRef(5);
  const ballSpeedY = useRef(3);
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const rallyCount = useRef(0);

  const resetBall = (directionToPlayer1: boolean) => {
    ballX.current = WIDTH / 2;
    ballY.current = HEIGHT / 2;
    rallyCount.current = 0;
    const angle = (Math.random() * 0.8 - 0.4); // random vertical velocity
    ballSpeedX.current = directionToPlayer1 ? -5.5 : 5.5;
    ballSpeedY.current = angle * 5;
  };

  const restartMatch = () => {
    p1Y.current = HEIGHT / 2 - PADDLE_H / 2;
    p2Y.current = HEIGHT / 2 - PADDLE_H / 2;
    setScore1(0);
    setScore2(0);
    setWinner(null);
    setIsPaused(false);
    resetBall(Math.random() > 0.5);
  };

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = true;

      if (['ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      if (e.key === 'p' || e.key === 'P') {
        setIsPaused(prev => !prev);
      }
      if (e.key === 'r' || e.key === 'R') {
        restartMatch();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main 60 FPS Game Loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      if (!isPaused && !winner) {
        // --- 1. Player 1 Movement (W / S) ---
        if ((keysPressed.current['w'] || keysPressed.current['W']) && p1Y.current > 0) {
          p1Y.current -= 6.5;
        }
        if ((keysPressed.current['s'] || keysPressed.current['S']) && p1Y.current < HEIGHT - PADDLE_H) {
          p1Y.current += 6.5;
        }

        // --- 2. Player 2 Movement (Keys or CPU AI) ---
        if (mode === '2P') {
          if (keysPressed.current['ArrowUp'] && p2Y.current > 0) {
            p2Y.current -= 6.5;
          }
          if (keysPressed.current['ArrowDown'] && p2Y.current < HEIGHT - PADDLE_H) {
            p2Y.current += 6.5;
          }
        } else {
          // CPU AI Tracking with reaction delay & imperfection
          const targetY = ballY.current - PADDLE_H / 2;
          const diff = targetY - p2Y.current;
          if (Math.abs(diff) > 10) {
            p2Y.current += Math.sign(diff) * Math.min(5.2, Math.abs(diff));
          }
          p2Y.current = Math.max(0, Math.min(HEIGHT - PADDLE_H, p2Y.current));
        }

        // --- 3. Ball Physics ---
        ballX.current += ballSpeedX.current;
        ballY.current += ballSpeedY.current;

        // Bounce top / bottom walls
        if (ballY.current <= 0 || ballY.current >= HEIGHT - BALL_SIZE) {
          ballSpeedY.current = -ballSpeedY.current;
          playHitSound(1.2);
        }

        // Check Paddle 1 Collision (Left)
        if (
          ballX.current <= 25 + PADDLE_W &&
          ballX.current >= 20 &&
          ballY.current + BALL_SIZE >= p1Y.current &&
          ballY.current <= p1Y.current + PADDLE_H
        ) {
          // Hit offset calculates rebound angle
          const hitOffset = (ballY.current + BALL_SIZE / 2 - (p1Y.current + PADDLE_H / 2)) / (PADDLE_H / 2);
          rallyCount.current += 1;
          const speedMultiplier = Math.min(1.8, 1 + rallyCount.current * 0.04);
          ballSpeedX.current = Math.abs(ballSpeedX.current) * speedMultiplier;
          ballSpeedY.current = hitOffset * 7;
          playHitSound(1.5);
        }

        // Check Paddle 2 Collision (Right)
        if (
          ballX.current + BALL_SIZE >= WIDTH - 25 - PADDLE_W &&
          ballX.current <= WIDTH - 20 &&
          ballY.current + BALL_SIZE >= p2Y.current &&
          ballY.current <= p2Y.current + PADDLE_H
        ) {
          const hitOffset = (ballY.current + BALL_SIZE / 2 - (p2Y.current + PADDLE_H / 2)) / (PADDLE_H / 2);
          rallyCount.current += 1;
          const speedMultiplier = Math.min(1.8, 1 + rallyCount.current * 0.04);
          ballSpeedX.current = -Math.abs(ballSpeedX.current) * speedMultiplier;
          ballSpeedY.current = hitOffset * 7;
          playHitSound(1.5);
        }

        // --- 4. Scoring ---
        if (ballX.current < 0) {
          // Player 2 / CPU scores
          playGameOverSound();
          setScore2(prev => {
            const next = prev + 1;
            if (next >= WINNING_SCORE) {
              setWinner(mode === '1P' ? 'CPU IA' : 'JUGADOR 2');
            }
            return next;
          });
          resetBall(true);
        } else if (ballX.current > WIDTH) {
          // Player 1 scores
          playScoreSound();
          setScore1(prev => {
            const next = prev + 1;
            onScoreUpdate?.(next * 100);
            if (next >= WINNING_SCORE) {
              setWinner('JUGADOR 1');
            }
            return next;
          });
          resetBall(false);
        }
      }

      // --- 5. Render Scene ---
      ctx.fillStyle = '#05020a';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // Dotted Center Net
      ctx.strokeStyle = '#2d1854';
      ctx.lineWidth = 4;
      ctx.setLineDash([12, 10]);
      ctx.beginPath();
      ctx.moveTo(WIDTH / 2, 0);
      ctx.lineTo(WIDTH / 2, HEIGHT);
      ctx.stroke();
      ctx.setLineDash([]); // reset

      // Draw Retro Scoreboard on Center Top
      ctx.font = '28px "Press Start 2P", monospace';
      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 10;
      ctx.fillText(String(score1), WIDTH / 2 - 80, 50);

      ctx.fillStyle = '#ffd700';
      ctx.shadowColor = '#ffd700';
      ctx.fillText(String(score2), WIDTH / 2 + 45, 50);
      ctx.shadowBlur = 0;

      // Draw Paddle 1 (Cyan Player)
      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 8;
      ctx.fillRect(25, p1Y.current, PADDLE_W, PADDLE_H);

      // Draw Paddle 2 (Gold CPU / P2)
      ctx.fillStyle = '#ffd700';
      ctx.shadowColor = '#ffd700';
      ctx.fillRect(WIDTH - 25 - PADDLE_W, p2Y.current, PADDLE_W, PADDLE_H);

      // Draw Ball (White with light trail)
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.fillRect(ballX.current, ballY.current, BALL_SIZE, BALL_SIZE);
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [mode, isPaused, winner, score1, score2, onScoreUpdate]);

  return (
    <div className="flex flex-col items-center">
      {/* Top HUD Controls */}
      <div className="w-full max-w-[640px] mb-3 flex items-center justify-between px-4 py-2.5 bg-arcade-dark border border-arcade-gold/30 rounded-xl font-pixel text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setMode(mode === '1P' ? '2P' : '1P'); restartMatch(); }}
            className="flex items-center gap-1.5 px-3 py-1 bg-arcade-panel hover:bg-arcade-surface text-arcade-gold border border-arcade-gold/40 rounded transition-colors"
          >
            {mode === '1P' ? <User className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
            <span>MODO: {mode}</span>
          </button>
          <span className="text-[10px] text-slate-500 hidden sm:inline">Primero a {WINNING_SCORE} pts</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaused(p => !p)}
            className="p-1.5 text-arcade-cyan hover:text-white transition-colors"
            title="Pausa (P)"
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
          <button
            onClick={restartMatch}
            className="p-1.5 text-arcade-gold hover:text-white transition-colors"
            title="Reiniciar (R)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Screen Frame */}
      <div className="relative border-4 border-arcade-gold/60 rounded-xl shadow-neon-gold crt-bloom overflow-hidden bg-black">
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          className="block w-full max-w-[640px] h-auto aspect-[16/10.5]"
        />

        {/* Winner Screen */}
        {winner && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center z-30">
            <h3 className="font-pixel text-xl text-arcade-gold mb-2 glow-gold">¡VICTORIA!</h3>
            <p className="font-pixel text-sm text-arcade-cyan mb-1">CAMPEÓN: {winner}</p>
            <p className="font-pixel text-xs text-slate-400 mb-4">{score1} - {score2}</p>
            <button
              onClick={restartMatch}
              className="px-5 py-2.5 bg-arcade-gold text-black font-pixel text-xs rounded hover:bg-yellow-400 transition-all shadow-neon-gold flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              JUGAR REVANCHA
            </button>
          </div>
        )}

        {/* Paused Screen */}
        {isPaused && !winner && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-30">
            <h3 className="font-pixel text-xl text-arcade-gold animate-pulse">PAUSA</h3>
            <p className="font-pixel text-[9px] text-slate-400 mt-2">Presiona P para continuar</p>
          </div>
        )}
      </div>

      {/* Control Help legend */}
      <div className="mt-3 flex items-center justify-between w-full max-w-[640px] px-2 text-[11px] font-pixel text-slate-400">
        <span>P1: [W / S]</span>
        <span>{mode === '1P' ? 'CPU: IA AUTOMÁTICA' : 'P2: [↑ / ↓]'}</span>
      </div>
    </div>
  );
};
