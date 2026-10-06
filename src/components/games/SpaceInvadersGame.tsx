import React, { useEffect, useRef, useState, useCallback } from 'react';
import { playLaserSound, playHitSound, playScoreSound, playGameOverSound } from '../../utils/arcadeAudio';
import { RotateCcw, Heart, Play, Pause } from 'lucide-react';

interface SpaceInvadersGameProps {
  onScoreUpdate?: (score: number) => void;
}

interface Alien {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 1 | 2 | 3;
  alive: boolean;
}

interface Bullet {
  x: number;
  y: number;
  isPlayer: boolean;
}

interface Bunker {
  x: number;
  y: number;
  w: number;
  h: number;
  health: number;
}

export const SpaceInvadersGame: React.FC<SpaceInvadersGameProps> = ({ onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const WIDTH = 600;
  const HEIGHT = 500;
  const PLAYER_W = 36;
  const PLAYER_H = 18;

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      return Number(localStorage.getItem('arcade_invaders_hs') || 4920);
    } catch {
      return 4920;
    }
  });
  const [lives, setLives] = useState(3);
  const [wave, setWave] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Mutable Game state
  const playerX = useRef(WIDTH / 2 - PLAYER_W / 2);
  const aliensRef = useRef<Alien[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const bunkersRef = useRef<Bunker[]>([]);
  const ufoRef = useRef<{ x: number; y: number; active: boolean } | null>(null);
  const alienDir = useRef(1); // 1 = right, -1 = left
  const alienStepTimer = useRef(0);
  const alienStepInterval = useRef(600); // gets faster as aliens die
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const scoreRef = useRef(0);
  const lastShotTime = useRef(0);

  const initAliens = useCallback(() => {
    const rows = 4;
    const cols = 9;
    const list: Alien[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        list.push({
          x: 60 + c * 52,
          y: 60 + r * 38,
          w: 28,
          h: 22,
          type: r === 0 ? 3 : (r <= 2 ? 2 : 1),
          alive: true,
        });
      }
    }
    aliensRef.current = list;
    alienStepInterval.current = 600;
    alienDir.current = 1;
  }, []);

  const initBunkers = useCallback(() => {
    const list: Bunker[] = [];
    const count = 4;
    for (let i = 0; i < count; i++) {
      list.push({
        x: 80 + i * 130,
        y: HEIGHT - 100,
        w: 52,
        h: 26,
        health: 4,
      });
    }
    bunkersRef.current = list;
  }, []);

  const restartGame = () => {
    playerX.current = WIDTH / 2 - PLAYER_W / 2;
    bulletsRef.current = [];
    ufoRef.current = null;
    scoreRef.current = 0;
    setScore(0);
    setLives(3);
    setWave(1);
    setGameOver(false);
    setIsPaused(false);
    initAliens();
    initBunkers();
  };

  // Keyboard navigation
  useEffect(() => {
    initAliens();
    initBunkers();

    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = true;

      if (['ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
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

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [initAliens, initBunkers]);

  // Main 60 FPS Game Loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const gameLoop = (time: number) => {
      const dt = time - lastTime;
      lastTime = time;

      if (!isPaused && !gameOver) {
        // --- 1. Player Movement ---
        if ((keysPressed.current['ArrowLeft'] || keysPressed.current['a'] || keysPressed.current['A']) && playerX.current > 15) {
          playerX.current -= 6;
        }
        if ((keysPressed.current['ArrowRight'] || keysPressed.current['d'] || keysPressed.current['D']) && playerX.current < WIDTH - PLAYER_W - 15) {
          playerX.current += 6;
        }

        // --- 2. Player Laser Shooting ---
        if (keysPressed.current[' '] && time - lastShotTime.current > 350) {
          const playerBullets = bulletsRef.current.filter(b => b.isPlayer);
          if (playerBullets.length < 2) {
            bulletsRef.current.push({
              x: playerX.current + PLAYER_W / 2 - 2,
              y: HEIGHT - 45,
              isPlayer: true,
            });
            playLaserSound();
            lastShotTime.current = time;
          }
        }

        // --- 3. UFO Saucer Chance ---
        if (!ufoRef.current && Math.random() < 0.002) {
          ufoRef.current = { x: -40, y: 30, active: true };
        }
        if (ufoRef.current) {
          ufoRef.current.x += 3;
          if (ufoRef.current.x > WIDTH + 50) {
            ufoRef.current = null;
          }
        }

        // --- 4. Bullets Movement & Collisions ---
        for (let i = bulletsRef.current.length - 1; i >= 0; i--) {
          const b = bulletsRef.current[i];
          if (b.isPlayer) {
            b.y -= 8;
            if (b.y < 0) {
              bulletsRef.current.splice(i, 1);
              continue;
            }

            // Check alien hit
            let bulletRemoved = false;
            for (const a of aliensRef.current) {
              if (a.alive && b.x >= a.x && b.x <= a.x + a.w && b.y >= a.y && b.y <= a.y + a.h) {
                a.alive = false;
                bulletsRef.current.splice(i, 1);
                bulletRemoved = true;
                const pts = a.type === 3 ? 30 : (a.type === 2 ? 20 : 10);
                scoreRef.current += pts;
                setScore(scoreRef.current);
                onScoreUpdate?.(scoreRef.current);
                playHitSound(1.8);

                // Speed up aliens
                alienStepInterval.current = Math.max(90, alienStepInterval.current - 12);
                break;
              }
            }
            if (bulletRemoved) continue;

            // Check UFO hit
            if (ufoRef.current && b.x >= ufoRef.current.x && b.x <= ufoRef.current.x + 40 && b.y >= 25 && b.y <= 45) {
              scoreRef.current += 150;
              setScore(scoreRef.current);
              onScoreUpdate?.(scoreRef.current);
              playScoreSound();
              ufoRef.current = null;
              bulletsRef.current.splice(i, 1);
              continue;
            }

            // Check Bunker hit by player
            for (const bunk of bunkersRef.current) {
              if (bunk.health > 0 && b.x >= bunk.x && b.x <= bunk.x + bunk.w && b.y >= bunk.y && b.y <= bunk.y + bunk.h) {
                bunk.health -= 1;
                bulletsRef.current.splice(i, 1);
                bulletRemoved = true;
                break;
              }
            }
          } else {
            // Alien bullet downwards
            b.y += 4.5;
            if (b.y > HEIGHT) {
              bulletsRef.current.splice(i, 1);
              continue;
            }

            // Hit Bunker
            let hit = false;
            for (const bunk of bunkersRef.current) {
              if (bunk.health > 0 && b.x >= bunk.x && b.x <= bunk.x + bunk.w && b.y >= bunk.y && b.y <= bunk.y + bunk.h) {
                bunk.health -= 1;
                bulletsRef.current.splice(i, 1);
                hit = true;
                break;
              }
            }
            if (hit) continue;

            // Hit Player
            if (
              b.x >= playerX.current &&
              b.x <= playerX.current + PLAYER_W &&
              b.y >= HEIGHT - 40 &&
              b.y <= HEIGHT - 40 + PLAYER_H
            ) {
              bulletsRef.current.splice(i, 1);
              playGameOverSound();
              setLives(prev => {
                const next = prev - 1;
                if (next <= 0) {
                  setGameOver(true);
                }
                return next;
              });
            }
          }
        }

        // --- 5. Alien Fleet Marching Step ---
        alienStepTimer.current += dt;
        if (alienStepTimer.current > alienStepInterval.current) {
          alienStepTimer.current = 0;

          // Check if any alien hit screen edge
          let shiftDown = false;
          const aliveAliens = aliensRef.current.filter(a => a.alive);

          if (aliveAliens.length === 0) {
            // Next Wave!
            setWave(w => w + 1);
            playScoreSound();
            initAliens();
            return;
          }

          for (const a of aliveAliens) {
            if ((alienDir.current === 1 && a.x + a.w >= WIDTH - 20) || (alienDir.current === -1 && a.x <= 20)) {
              shiftDown = true;
              break;
            }
          }

          if (shiftDown) {
            alienDir.current *= -1;
            for (const a of aliveAliens) {
              a.y += 18;
              if (a.y + a.h >= HEIGHT - 55) {
                // Aliens invaded Earth!
                playGameOverSound();
                setGameOver(true);
              }
            }
          } else {
            for (const a of aliveAliens) {
              a.x += alienDir.current * 12;
            }
          }

          // Random alien shoots
          if (Math.random() < 0.45 && aliveAliens.length > 0) {
            const shooter = aliveAliens[Math.floor(Math.random() * aliveAliens.length)];
            bulletsRef.current.push({
              x: shooter.x + shooter.w / 2,
              y: shooter.y + shooter.h,
              isPlayer: false,
            });
          }
        }

        if (scoreRef.current > highScore) {
          setHighScore(scoreRef.current);
          try {
            localStorage.setItem('arcade_invaders_hs', String(scoreRef.current));
          } catch {
            // fallback
          }
        }
      }

      // --- 6. Render Scene ---
      ctx.fillStyle = '#05020a';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // Starfield dots
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let i = 0; i < 25; i++) {
        ctx.fillRect((i * 47) % WIDTH, (i * 31) % HEIGHT, 1.5, 1.5);
      }

      // Draw Mystery UFO
      if (ufoRef.current) {
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 10;
        ctx.fillRect(ufoRef.current.x, ufoRef.current.y, 40, 14);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(ufoRef.current.x + 12, ufoRef.current.y - 4, 16, 6);
        ctx.shadowBlur = 0;
      }

      // Draw Aliens
      for (const a of aliensRef.current) {
        if (!a.alive) continue;
        const color = a.type === 3 ? '#ffd700' : (a.type === 2 ? '#a855f7' : '#00f0ff');
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 6;
        ctx.fillRect(a.x, a.y, a.w, a.h);

        // Pixel antenna & eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(a.x + 5, a.y + 6, 4, 5);
        ctx.fillRect(a.x + a.w - 9, a.y + 6, 4, 5);
      }
      ctx.shadowBlur = 0;

      // Draw Bunkers
      for (const b of bunkersRef.current) {
        if (b.health <= 0) continue;
        const alpha = b.health / 4;
        ctx.fillStyle = `rgba(34, 197, 94, ${alpha})`;
        ctx.fillRect(b.x, b.y, b.w, b.h);
      }

      // Draw Bullets
      for (const b of bulletsRef.current) {
        if (b.isPlayer) {
          ctx.fillStyle = '#00f0ff';
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 8;
          ctx.fillRect(b.x, b.y, 3, 12);
        } else {
          ctx.fillStyle = '#ef4444';
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 6;
          ctx.fillRect(b.x, b.y, 3, 10);
        }
      }
      ctx.shadowBlur = 0;

      // Draw Player Cannon
      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 10;
      ctx.fillRect(playerX.current, HEIGHT - 38, PLAYER_W, 14);
      ctx.fillRect(playerX.current + PLAYER_W / 2 - 3, HEIGHT - 46, 6, 10);
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, gameOver, highScore, onScoreUpdate, initAliens]);

  return (
    <div className="flex flex-col items-center">
      {/* Top HUD */}
      <div className="w-full max-w-[600px] mb-3 flex items-center justify-between px-4 py-2 bg-arcade-dark border border-arcade-cyan/30 rounded-xl font-pixel text-xs text-arcade-cyan">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-arcade-gold">SCORE: </span>
            <span className="text-white font-bold">{score}</span>
          </div>
          <div className="flex items-center gap-1 text-red-500">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                className={`w-3.5 h-3.5 ${i < lives ? 'fill-red-500 text-red-500' : 'text-slate-700'}`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-[10px] text-arcade-purple">
            <span>OLA: </span>
            <span className="text-white font-bold">{wave}</span>
          </div>
          <button onClick={() => setIsPaused(p => !p)} className="p-1 hover:text-arcade-gold">
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
          <button onClick={restartGame} className="p-1 hover:text-arcade-gold">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Screen Frame */}
      <div className="relative border-4 border-arcade-cyan/60 rounded-xl shadow-neon-cyan crt-bloom overflow-hidden bg-black">
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          className="block w-full max-w-[600px] h-auto aspect-[6/5]"
        />

        {gameOver && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center z-30">
            <h3 className="font-pixel text-2xl text-red-500 mb-2 glow-gold">INVASIÓN TOTAL</h3>
            <p className="font-pixel text-xs text-arcade-gold mb-1">SCORE: {score}</p>
            <p className="font-pixel text-[10px] text-arcade-cyan mb-4">SOBREVIVISTE HASTA OLA {wave}</p>
            <button
              onClick={restartGame}
              className="px-5 py-2.5 bg-arcade-gold text-black font-pixel text-xs rounded hover:bg-yellow-400 transition-all shadow-neon-gold flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              INSERT COIN / JUGAR DE NUEVO
            </button>
          </div>
        )}

        {isPaused && !gameOver && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-30">
            <h3 className="font-pixel text-xl text-arcade-cyan animate-pulse">PAUSA</h3>
            <p className="font-pixel text-[9px] text-slate-400 mt-2">Presiona P para continuar</p>
          </div>
        )}
      </div>

      <div className="mt-3 text-center text-[10px] font-pixel text-slate-500">
        [← / →] Mover cañón • [ESPACIO] Disparar láser
      </div>
    </div>
  );
};
