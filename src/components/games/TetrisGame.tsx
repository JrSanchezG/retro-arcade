import React, { useEffect, useRef, useState, useCallback } from 'react';
import { playHitSound, playScoreSound, playGameOverSound } from '../../utils/arcadeAudio';
import { RotateCcw, Play, Pause } from 'lucide-react';

interface TetrisGameProps {
  onScoreUpdate?: (score: number) => void;
}

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 24;

type Matrix = number[][];

interface Tetromino {
  shape: Matrix;
  color: string;
  name: string;
}

const TETROMINOES: Record<string, Tetromino> = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: '#00f0ff', // Cyan
    name: 'I',
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: '#ffd700', // Gold
    name: 'O',
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#a855f7', // Purple
    name: 'T',
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: '#22c55e', // Green
    name: 'S',
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: '#ef4444', // Red
    name: 'Z',
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#3b82f6', // Blue
    name: 'J',
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#f97316', // Orange
    name: 'L',
  },
};

const TETROMINO_KEYS = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

export const TetrisGame: React.FC<TetrisGameProps> = ({ onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(() => {
    try {
      return Number(localStorage.getItem('arcade_tetris_hs') || 18450);
    } catch {
      return 18450;
    }
  });
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Board state: rows x cols containing null or color string
  const boardRef = useRef<(string | null)[][]>(
    Array.from({ length: ROWS }, () => Array(COLS).fill(null))
  );

  const currentPieceRef = useRef<Tetromino>(TETROMINOES['T']);
  const pieceX = useRef(3);
  const pieceY = useRef(0);
  const dropCounter = useRef(0);
  const dropInterval = useRef(600); // ms per step
  const lastTime = useRef(0);
  const scoreRef = useRef(0);

  const getRandomPiece = () => {
    const key = TETROMINO_KEYS[Math.floor(Math.random() * TETROMINO_KEYS.length)];
    return TETROMINOES[key];
  };

  const checkCollision = (piece: Matrix, px: number, py: number): boolean => {
    const board = boardRef.current;
    for (let r = 0; r < piece.length; r++) {
      for (let c = 0; c < piece[r].length; c++) {
        if (piece[r][c] !== 0) {
          const newX = px + c;
          const newY = py + r;

          // Wall and floor boundaries
          if (newX < 0 || newX >= COLS || newY >= ROWS) {
            return true;
          }
          // Board cells already occupied
          if (newY >= 0 && board[newY][newX] !== null) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const rotateMatrix = (matrix: Matrix): Matrix => {
    return matrix[0].map((_, index) => matrix.map(row => row[index]).reverse());
  };

  const lockPiece = useCallback(() => {
    const piece = currentPieceRef.current;
    const board = boardRef.current;

    // Stamp piece to board
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (piece.shape[r][c] !== 0) {
          const by = pieceY.current + r;
          const bx = pieceX.current + c;
          if (by >= 0 && by < ROWS && bx >= 0 && bx < COLS) {
            board[by][bx] = piece.color;
          }
        }
      }
    }

    playHitSound(1.1);

    // Clear completed lines
    let cleared = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r].every(cell => cell !== null)) {
        board.splice(r, 1);
        board.unshift(Array(COLS).fill(null));
        cleared += 1;
        r++; // re-check index
      }
    }

    if (cleared > 0) {
      playScoreSound();
      const pointsTable = [0, 100, 300, 600, 1200];
      const pts = (pointsTable[cleared] || 100) * level;
      scoreRef.current += pts;
      setScore(scoreRef.current);
      onScoreUpdate?.(scoreRef.current);

      setLines(prev => {
        const next = prev + cleared;
        const newLevel = Math.floor(next / 10) + 1;
        setLevel(newLevel);
        dropInterval.current = Math.max(120, 600 - (newLevel - 1) * 45);
        return next;
      });

      if (scoreRef.current > highScore) {
        setHighScore(scoreRef.current);
        try {
          localStorage.setItem('arcade_tetris_hs', String(scoreRef.current));
        } catch {
          // fallback
        }
      }
    }

    // Spawn new piece
    const nextPiece = getRandomPiece();
    currentPieceRef.current = nextPiece;
    pieceX.current = Math.floor(COLS / 2) - Math.floor(nextPiece.shape[0].length / 2);
    pieceY.current = 0;

    // Check game over
    if (checkCollision(nextPiece.shape, pieceX.current, pieceY.current)) {
      playGameOverSound();
      setGameOver(true);
    }
  }, [highScore, level, onScoreUpdate]);

  const drop = useCallback(() => {
    if (!checkCollision(currentPieceRef.current.shape, pieceX.current, pieceY.current + 1)) {
      pieceY.current += 1;
    } else {
      lockPiece();
    }
    dropCounter.current = 0;
  }, [lockPiece]);

  const hardDrop = () => {
    while (!checkCollision(currentPieceRef.current.shape, pieceX.current, pieceY.current + 1)) {
      pieceY.current += 1;
      scoreRef.current += 2;
    }
    lockPiece();
  };

  const restartGame = () => {
    boardRef.current = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    currentPieceRef.current = getRandomPiece();
    pieceX.current = 3;
    pieceY.current = 0;
    setScore(0);
    scoreRef.current = 0;
    setLines(0);
    setLevel(1);
    dropInterval.current = 600;
    setGameOver(false);
    setIsPaused(false);
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
        restartGame();
        return;
      }

      if (gameOver || isPaused) return;

      const piece = currentPieceRef.current;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        if (!checkCollision(piece.shape, pieceX.current - 1, pieceY.current)) {
          pieceX.current -= 1;
        }
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        if (!checkCollision(piece.shape, pieceX.current + 1, pieceY.current)) {
          pieceX.current += 1;
        }
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        drop();
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        // Rotate
        const rotated = rotateMatrix(piece.shape);
        if (!checkCollision(rotated, pieceX.current, pieceY.current)) {
          piece.shape = rotated;
          playHitSound(1.4);
        } else if (!checkCollision(rotated, pieceX.current - 1, pieceY.current)) {
          // wall kick left
          pieceX.current -= 1;
          piece.shape = rotated;
          playHitSound(1.4);
        } else if (!checkCollision(rotated, pieceX.current + 1, pieceY.current)) {
          // wall kick right
          pieceX.current += 1;
          piece.shape = rotated;
          playHitSound(1.4);
        }
      } else if (e.code === 'Space') {
        hardDrop();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, isPaused, drop]);

  // Main animation frame loop for drop timing & drawing
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = (time: number = 0) => {
      const dt = time - lastTime.current;
      lastTime.current = time;

      if (!isPaused && !gameOver) {
        dropCounter.current += dt;
        if (dropCounter.current > dropInterval.current) {
          drop();
        }
      }

      // --- Render Canvas ---
      ctx.fillStyle = '#05020a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Grid Matrix
      ctx.strokeStyle = '#120b22';
      ctx.lineWidth = 1;
      for (let r = 0; r <= ROWS; r++) {
        ctx.beginPath();
        ctx.moveTo(0, r * BLOCK_SIZE);
        ctx.lineTo(COLS * BLOCK_SIZE, r * BLOCK_SIZE);
        ctx.stroke();
      }
      for (let c = 0; c <= COLS; c++) {
        ctx.beginPath();
        ctx.moveTo(c * BLOCK_SIZE, 0);
        ctx.lineTo(c * BLOCK_SIZE, ROWS * BLOCK_SIZE);
        ctx.stroke();
      }

      // Draw Settled Board Blocks
      const board = boardRef.current;
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const color = board[r][c];
          if (color) {
            ctx.fillStyle = color;
            ctx.fillRect(c * BLOCK_SIZE + 1, r * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);

            // Highlight border
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(c * BLOCK_SIZE + 1, r * BLOCK_SIZE + 1, BLOCK_SIZE - 2, 3);
          }
        }
      }

      // Calculate Ghost Piece position (projection)
      const piece = currentPieceRef.current;
      let ghostY = pieceY.current;
      while (!checkCollision(piece.shape, pieceX.current, ghostY + 1)) {
        ghostY += 1;
      }

      // Draw Ghost Piece (Holographic Outline)
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
      ctx.lineWidth = 1.5;
      for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
          if (piece.shape[r][c] !== 0) {
            ctx.strokeRect(
              (pieceX.current + c) * BLOCK_SIZE + 2,
              (ghostY + r) * BLOCK_SIZE + 2,
              BLOCK_SIZE - 4,
              BLOCK_SIZE - 4
            );
          }
        }
      }

      // Draw Active Piece
      ctx.fillStyle = piece.color;
      ctx.shadowColor = piece.color;
      ctx.shadowBlur = 8;
      for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
          if (piece.shape[r][c] !== 0) {
            const bx = (pieceX.current + c) * BLOCK_SIZE;
            const by = (pieceY.current + r) * BLOCK_SIZE;
            ctx.fillRect(bx + 1, by + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);

            // 3D block reflection
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.fillRect(bx + 1, by + 1, BLOCK_SIZE - 2, 3);
            ctx.fillStyle = piece.color;
          }
        }
      }
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [drop, isPaused, gameOver]);

  return (
    <div className="flex flex-col items-center">
      {/* Top HUD */}
      <div className="w-full max-w-[340px] mb-3 flex items-center justify-between px-3 py-2 bg-arcade-dark border border-arcade-cyan/30 rounded-xl font-pixel text-xs text-arcade-cyan">
        <div>
          <span className="text-arcade-gold">SCORE: </span>
          <span className="text-white font-bold">{score}</span>
        </div>
        <div>
          <span className="text-arcade-purple">LVL: </span>
          <span className="text-arcade-gold font-bold">{level}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsPaused(p => !p)} className="p-1 hover:text-arcade-gold">
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
          <button onClick={restartGame} className="p-1 hover:text-arcade-gold">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex gap-4 items-start">
        {/* Main Canvas Matrix */}
        <div className="relative border-4 border-arcade-cyan/60 rounded-xl shadow-neon-cyan crt-bloom overflow-hidden bg-black">
          <canvas
            ref={canvasRef}
            width={COLS * BLOCK_SIZE}
            height={ROWS * BLOCK_SIZE}
            className="block aspect-[10/20]"
          />

          {gameOver && (
            <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-4 text-center z-30">
              <h3 className="font-pixel text-xl text-red-500 mb-2 glow-gold">GAME OVER</h3>
              <p className="font-pixel text-[10px] text-arcade-gold mb-1">SCORE: {score}</p>
              <p className="font-pixel text-[10px] text-arcade-cyan mb-4">LÍNEAS: {lines}</p>
              <button
                onClick={restartGame}
                className="px-4 py-2 bg-arcade-gold text-black font-pixel text-[10px] rounded hover:bg-yellow-400 transition-all shadow-neon-gold flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                INSERT COIN
              </button>
            </div>
          )}

          {isPaused && !gameOver && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-30">
              <h3 className="font-pixel text-lg text-arcade-cyan animate-pulse">PAUSA</h3>
              <p className="font-pixel text-[8px] text-slate-400 mt-1">Presiona P</p>
            </div>
          )}
        </div>

        {/* Side Panel: Lines, Controls */}
        <div className="w-28 flex flex-col gap-3 font-pixel text-[10px]">
          <div className="p-2.5 rounded-xl bg-arcade-dark border border-arcade-purple/40 text-center">
            <span className="text-slate-400 block text-[9px] mb-1">LÍNEAS</span>
            <span className="text-white text-sm font-bold">{lines}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-arcade-dark border border-arcade-gold/40 text-center">
            <span className="text-slate-400 block text-[9px] mb-1">RÉCORD</span>
            <span className="text-arcade-gold text-[10px] font-bold">{highScore}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-arcade-dark/80 border border-slate-800 text-[8px] text-slate-400 space-y-1">
            <p className="text-arcade-cyan font-bold">CONTROLES:</p>
            <p>↑: Rotar</p>
            <p>←/→: Mover</p>
            <p>↓: Caer</p>
            <p className="text-arcade-gold font-bold">ESPACIO: Hard Drop</p>
          </div>
        </div>
      </div>
    </div>
  );
};
