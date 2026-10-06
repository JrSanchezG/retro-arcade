import type { ArcadeGame } from '../types';

export const arcadeGames: ArcadeGame[] = [
  {
    id: 'snake',
    title: 'Neon Snake 1997',
    genre: 'classics',
    genreLabel: 'Clásico Retro',
    year: 1997,
    players: '1P',
    rating: 4.9,
    highScore: 1420,
    accentColor: 'cyan',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    previewVideo: 'https://assets.mixkit.co/videos/preview/mixkit-matrix-style-binary-code-12964-large.mp4',
    tagline: 'Devora píxeles de energía sin colisionar contra tu propia cola.',
    description: 'La legendaria serpiente arcade remasterizada con luces de neón, partículas de impacto y frutas especiales. Cada manzana aumenta tu velocidad y tamaño.',
    difficulty: 'Fácil',
    controls: [
      { key: '↑ / W', action: 'Subir' },
      { key: '↓ / S', action: 'Bajar' },
      { key: '← / A', action: 'Izquierda' },
      { key: '→ / D', action: 'Derecha' },
      { key: 'P', action: 'Pausa' },
      { key: 'R', action: 'Reiniciar' }
    ],
    features: [
      'Control suave con cambio de dirección instantáneo',
      'Frutas doradas bonus temporales (+50 pts)',
      'Escalado de velocidad progresivo cada 5 manzanas',
      'Efectos de partículas y estela de neón azul celeste'
    ],
    pythonCode: `# ==========================================
# NEON SNAKE - ARCADE EDITION (PYGAME)
# Creado por Junior Sánchez
# ==========================================
import pygame
import random
import sys

pygame.init()
WIDTH, HEIGHT = 600, 600
GRID_SIZE = 20
FPS = 12

# Colores Arcade
BLACK = (5, 2, 10)
CYAN = (0, 240, 255)
GOLD = (255, 215, 0)
DARK_PURPLE = (30, 10, 60)

screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Neon Snake - Arcade Edition")
clock = pygame.time.Clock()

snake = [(100, 100), (80, 100), (60, 100)]
direction = (GRID_SIZE, 0)
food = (random.randrange(0, WIDTH, GRID_SIZE), random.randrange(0, HEIGHT, GRID_SIZE))
score = 0

running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        elif event.type == pygame.KEYDOWN:
            if event.key in (pygame.K_UP, pygame.K_w) and direction != (0, GRID_SIZE):
                direction = (0, -GRID_SIZE)
            elif event.key in (pygame.K_DOWN, pygame.K_s) and direction != (0, -GRID_SIZE):
                direction = (0, GRID_SIZE)
            elif event.key in (pygame.K_LEFT, pygame.K_a) and direction != (GRID_SIZE, 0):
                direction = (-GRID_SIZE, 0)
            elif event.key in (pygame.K_RIGHT, pygame.K_d) and direction != (-GRID_SIZE, 0):
                direction = (GRID_SIZE, 0)

    # Mover serpiente
    new_head = (snake[0][0] + direction[0], snake[0][1] + direction[1])

    # Colisión con bordes o consigo misma
    if (new_head[0] < 0 or new_head[0] >= WIDTH or 
        new_head[1] < 0 or new_head[1] >= HEIGHT or 
        new_head in snake):
        print(f"GAME OVER! Score final: {score}")
        snake = [(100, 100), (80, 100), (60, 100)]
        direction = (GRID_SIZE, 0)
        score = 0
        continue

    snake.insert(0, new_head)
    if new_head == food:
        score += 10
        food = (random.randrange(0, WIDTH, GRID_SIZE), random.randrange(0, HEIGHT, GRID_SIZE))
    else:
        snake.pop()

    # Dibujado
    screen.fill(BLACK)
    # Comida
    pygame.draw.rect(screen, GOLD, (*food, GRID_SIZE - 2, GRID_SIZE - 2))
    # Serpiente
    for seg in snake:
        pygame.draw.rect(screen, CYAN, (*seg, GRID_SIZE - 2, GRID_SIZE - 2))

    pygame.display.flip()
    clock.tick(FPS)

pygame.quit()
sys.exit()`
  },
  {
    id: 'pong',
    title: 'Pinpon Cyber 1982',
    genre: 'sports',
    genreLabel: 'Deportes & Paletas',
    year: 1982,
    players: '1P / 2P',
    rating: 4.8,
    highScore: 11,
    accentColor: 'gold',
    coverImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80',
    previewVideo: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-retro-grid-with-stars-and-geometric-shapes-41883-large.mp4',
    tagline: 'El duelo supremo de reflejos: humano contra IA o cara a cara en 2P.',
    description: 'El clásico Pong reinventado con efectos CRT, velocidad de rebote dinámica, estelas de luz cibernética y modo 1 Jugador contra IA o 2 Jugadores en el mismo teclado.',
    difficulty: 'Medio',
    controls: [
      { key: 'W / S', action: 'Jugador 1 (Paleta Izq)' },
      { key: '↑ / ↓', action: 'Jugador 2 (Paleta Der)' },
      { key: '1 / 2', action: 'Modo 1P / 2P' },
      { key: 'ESPACIO', action: 'Sacar Pelota' },
      { key: 'P', action: 'Pausa' }
    ],
    features: [
      'IA reactiva con predicción de trayectoria',
      'Modo Local para 2 Jugadores en el mismo teclado',
      'Aceleración de rebote según el punto de impacto de la paleta',
      'Marcador retro LED estilo arcade 1982'
    ],
    pythonCode: `# ==========================================
# PINPON CYBERPUNK - ARCADE EDITION (PYGAME)
# Creado por Junior Sánchez
# ==========================================
import pygame
import sys

pygame.init()
WIDTH, HEIGHT = 800, 500
PADDLE_WIDTH, PADDLE_HEIGHT = 15, 90
BALL_SIZE = 14

BLACK = (5, 2, 10)
GOLD = (255, 215, 0)
CYAN = (0, 240, 255)
WHITE = (255, 255, 255)

screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Pinpon Cyber 1982 - Arcade Edition")
clock = pygame.time.Clock()

p1_y = HEIGHT // 2 - PADDLE_HEIGHT // 2
p2_y = HEIGHT // 2 - PADDLE_HEIGHT // 2
ball_x, ball_y = WIDTH // 2, HEIGHT // 2
ball_dx, ball_dy = 6, 6
p1_score, p2_score = 0, 0

running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    keys = pygame.key.get_pressed()
    # P1 (W / S)
    if keys[pygame.K_w] and p1_y > 0:
        p1_y -= 7
    if keys[pygame.K_s] and p1_y < HEIGHT - PADDLE_HEIGHT:
        p1_y += 7

    # CPU AI simple tracking
    if ball_y > p2_y + PADDLE_HEIGHT // 2 and p2_y < HEIGHT - PADDLE_HEIGHT:
        p2_y += 6
    elif ball_y < p2_y + PADDLE_HEIGHT // 2 and p2_y > 0:
        p2_y -= 6

    # Mover pelota
    ball_x += ball_dx
    ball_y += ball_dy

    # Rebote techo y suelo
    if ball_y <= 0 or ball_y >= HEIGHT - BALL_SIZE:
        ball_dy = -ball_dy

    # Colisión con paletas
    if (ball_x <= 30 + PADDLE_WIDTH and p1_y <= ball_y <= p1_y + PADDLE_HEIGHT) or \\
       (ball_x >= WIDTH - 30 - PADDLE_WIDTH - BALL_SIZE and p2_y <= ball_y <= p2_y + PADDLE_HEIGHT):
        ball_dx = -ball_dx * 1.05  # Aumenta la velocidad

    # Puntos
    if ball_x < 0:
        p2_score += 1
        ball_x, ball_y = WIDTH // 2, HEIGHT // 2
        ball_dx = 6
    elif ball_x > WIDTH:
        p1_score += 1
        ball_x, ball_y = WIDTH // 2, HEIGHT // 2
        ball_dx = -6

    # Render
    screen.fill(BLACK)
    pygame.draw.line(screen, (40, 20, 70), (WIDTH // 2, 0), (WIDTH // 2, HEIGHT), 2)
    pygame.draw.rect(screen, CYAN, (30, p1_y, PADDLE_WIDTH, PADDLE_HEIGHT))
    pygame.draw.rect(screen, GOLD, (WIDTH - 30 - PADDLE_WIDTH, p2_y, PADDLE_WIDTH, PADDLE_HEIGHT))
    pygame.draw.circle(screen, WHITE, (int(ball_x), int(ball_y)), BALL_SIZE // 2)

    pygame.display.flip()
    clock.tick(60)

pygame.quit()
sys.exit()`
  },
  {
    id: 'blockbreaker',
    title: 'Blockbreaker Neon',
    genre: 'action',
    genreLabel: 'Acción & Rompeladrillos',
    year: 1986,
    players: '1P',
    rating: 4.9,
    highScore: 3850,
    accentColor: 'purple',
    coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
    previewVideo: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-animation-32862-large.mp4',
    tagline: 'Destruye las matrices de bloques holográficos con combos devastadores.',
    description: 'Inspirado en Arkanoid y Breakout. Controla tu nave-paleta para rebotar la esfera de plasma contra hileras de bloques de múltiples resistencias, liberando power-ups y multiplicadores de puntuación.',
    difficulty: 'Medio',
    controls: [
      { key: '← / →', action: 'Mover Paleta' },
      { key: 'A / D', action: 'Mover Paleta' },
      { key: 'Ratón', action: 'Mover Paleta por Cursor' },
      { key: 'ESPACIO', action: 'Lanzar Esfera' },
      { key: 'P', action: 'Pausa' }
    ],
    features: [
      'Matriz de ladrillos dorados, púrpuras y cianes con distinta durabilidad',
      'Control híbrido por teclado o ratón ultrasuave',
      'Power-ups de expansión de paleta y esferas múltiples',
      'Físicas de rebote angular basadas en punto de contacto'
    ],
    pythonCode: `# ==========================================
# BLOCKBREAKER NEON - ARCADE (PYGAME)
# Creado por Junior Sánchez
# ==========================================
import pygame
import sys

pygame.init()
WIDTH, HEIGHT = 700, 600
PADDLE_W, PADDLE_H = 100, 16
BALL_RADIUS = 8

BLACK = (7, 4, 15)
GOLD = (255, 215, 0)
CYAN = (0, 240, 255)
PURPLE = (168, 85, 247)

screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Blockbreaker Neon - Arcade Edition")
clock = pygame.time.Clock()

paddle_x = WIDTH // 2 - PADDLE_W // 2
paddle_y = HEIGHT - 40
ball_x, ball_y = WIDTH // 2, HEIGHT - 60
ball_dx, ball_dy = 5, -5
lives = 3
score = 0

# Generar ladrillos
BRICK_ROWS = 5
BRICK_COLS = 10
BRICK_W = 60
BRICK_H = 22
bricks = []
for r in range(BRICK_ROWS):
    for c in range(BRICK_COLS):
        bx = 35 + c * (BRICK_W + 5)
        by = 50 + r * (BRICK_H + 8)
        color = GOLD if r == 0 else (PURPLE if r < 3 else CYAN)
        bricks.append(pygame.Rect(bx, by, BRICK_W, BRICK_H))

running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    keys = pygame.key.get_pressed()
    if keys[pygame.K_LEFT] and paddle_x > 0:
        paddle_x -= 8
    if keys[pygame.K_RIGHT] and paddle_x < WIDTH - PADDLE_W:
        paddle_x += 8

    # Mover bola
    ball_x += ball_dx
    ball_y += ball_dy

    # Rebote paredes
    if ball_x <= BALL_RADIUS or ball_x >= WIDTH - BALL_RADIUS:
        ball_dx = -ball_dx
    if ball_y <= BALL_RADIUS:
        ball_dy = -ball_dy

    # Colisión con paleta
    paddle_rect = pygame.Rect(paddle_x, paddle_y, PADDLE_W, PADDLE_H)
    ball_rect = pygame.Rect(ball_x - BALL_RADIUS, ball_y - BALL_RADIUS, BALL_RADIUS * 2, BALL_RADIUS * 2)

    if ball_rect.colliderect(paddle_rect) and ball_dy > 0:
        offset = (ball_x - (paddle_x + PADDLE_W / 2)) / (PADDLE_W / 2)
        ball_dx = offset * 7
        ball_dy = -abs(ball_dy)

    # Colisión con ladrillos
    for b in bricks[:]:
        if ball_rect.colliderect(b):
            bricks.remove(b)
            ball_dy = -ball_dy
            score += 50
            break

    # Caída al fondo
    if ball_y > HEIGHT:
        lives -= 1
        if lives <= 0:
            print("GAME OVER")
            running = False
        else:
            ball_x, ball_y = WIDTH // 2, HEIGHT - 60
            ball_dx, ball_dy = 5, -5

    # Dibujado
    screen.fill(BLACK)
    for b in bricks:
        pygame.draw.rect(screen, PURPLE, b, border_radius=3)
    pygame.draw.rect(screen, CYAN, paddle_rect, border_radius=5)
    pygame.draw.circle(screen, GOLD, (int(ball_x), int(ball_y)), BALL_RADIUS)

    pygame.display.flip()
    clock.tick(60)

pygame.quit()
sys.exit()`
  },
  {
    id: 'tetris',
    title: 'Tetris Pixel Blocks',
    genre: 'puzzle',
    genreLabel: 'Puzzle & Estrategia',
    year: 1984,
    players: '1P',
    rating: 5.0,
    highScore: 18450,
    accentColor: 'gold',
    coverImage: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=600&q=80',
    previewVideo: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-code-31911-large.mp4',
    tagline: 'Apila las 7 piezas geométricas y completa líneas para la máxima puntuación.',
    description: 'La obra maestra de los videojuegos soviéticos con el algoritmo oficial de rotación de tetrominós (SRS), proyección de sombra (ghost piece), eliminación de filas completas con animación de destello y niveles con gravedad creciente.',
    difficulty: 'Difícil',
    controls: [
      { key: '← / →', action: 'Mover Pieza' },
      { key: '↑ / W', action: 'Rotar Tetrominó' },
      { key: '↓ / S', action: 'Bajar Rápido (Soft Drop)' },
      { key: 'ESPACIO', action: 'Caída Instantánea (Hard Drop)' },
      { key: 'C', action: 'Guardar Pieza (Hold)' },
      { key: 'P', action: 'Pausa' }
    ],
    features: [
      'Los 7 tetrominós clásicos (I, J, L, O, S, T, Z) con paleta neón brillante',
      'Proyección holográfica de caída (Ghost Piece)',
      "Detección de combos y 'Tetris' (4 filas simultáneas)",
      'Subida de nivel y velocidad de gravedad cada 10 filas'
    ],
    pythonCode: `# ==========================================
# TETRIS PIXEL BLOCKS - ARCADE (PYGAME)
# Creado por Junior Sánchez
# ==========================================
import pygame
import random
import sys

pygame.init()
ROWS, COLS = 20, 10
BLOCK_SIZE = 28
WIDTH = COLS * BLOCK_SIZE + 220
HEIGHT = ROWS * BLOCK_SIZE

BLACK = (5, 2, 10)
CYAN = (0, 240, 255)
GOLD = (255, 215, 0)
PURPLE = (168, 85, 247)
RED = (239, 68, 68)
GREEN = (34, 197, 94)

SHAPES = [
    ([[1, 1, 1, 1]], CYAN),           # I
    ([[1, 1], [1, 1]], GOLD),         # O
    ([[0, 1, 0], [1, 1, 1]], PURPLE),  # T
    ([[1, 0, 0], [1, 1, 1]], (59, 130, 246)), # J
    ([[0, 0, 1], [1, 1, 1]], (249, 115, 22)), # L
    ([[0, 1, 1], [1, 1, 0]], GREEN),  # S
    ([[1, 1, 0], [0, 1, 1]], RED)     # Z
]

screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Tetris Pixel Blocks - Arcade Edition")
clock = pygame.time.Clock()

board = [[BLACK for _ in range(COLS)] for _ in range(ROWS)]
current_piece = random.choice(SHAPES)
px, py = COLS // 2 - len(current_piece[0][0]) // 2, 0
score = 0
fall_time = 0

def check_collision(piece, offset_x, offset_y):
    shape = piece[0]
    for r in range(len(shape)):
        for c in range(len(shape[0])):
            if shape[r][c]:
                new_x = offset_x + c
                new_y = offset_y + r
                if new_x < 0 or new_x >= COLS or new_y >= ROWS:
                    return True
                if new_y >= 0 and board[new_y][new_x] != BLACK:
                    return True
    return False

running = True
while running:
    dt = clock.tick(60)
    fall_time += dt

    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        elif event.type == pygame.KEYDOWN:
            if event.key == pygame.K_LEFT and not check_collision(current_piece, px - 1, py):
                px -= 1
            elif event.key == pygame.K_RIGHT and not check_collision(current_piece, px + 1, py):
                px += 1
            elif event.key == pygame.K_DOWN and not check_collision(current_piece, px, py + 1):
                py += 1
            elif event.key == pygame.K_UP:
                # Rotar
                rotated = [list(row) for row in zip(*current_piece[0][::-1])]
                if not check_collision((rotated, current_piece[1]), px, py):
                    current_piece = (rotated, current_piece[1])

    if fall_time > 450:
        if not check_collision(current_piece, px, py + 1):
            py += 1
        else:
            # Fijar pieza
            shape, color = current_piece
            for r in range(len(shape)):
                for c in range(len(shape[0])):
                    if shape[r][c] and py + r >= 0:
                        board[py + r][px + c] = color

            # Limpiar filas
            lines_cleared = 0
            for r in range(ROWS):
                if all(board[r][c] != BLACK for c in range(COLS)):
                    del board[r]
                    board.insert(0, [BLACK for _ in range(COLS)])
                    lines_cleared += 1
            score += lines_cleared * 100

            # Nueva pieza
            current_piece = random.choice(SHAPES)
            px, py = COLS // 2 - len(current_piece[0][0]) // 2, 0
            if check_collision(current_piece, px, py):
                print("GAME OVER")
                running = False
        fall_time = 0

    # Dibujado
    screen.fill((10, 5, 20))
    # Tablero
    for r in range(ROWS):
        for c in range(COLS):
            pygame.draw.rect(screen, board[r][c], (c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1))

    # Pieza actual
    shape, color = current_piece
    for r in range(len(shape)):
        for c in range(len(shape[0])):
            if shape[r][c]:
                pygame.draw.rect(screen, color, ((px + c) * BLOCK_SIZE, (py + r) * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1))

    pygame.display.flip()

pygame.quit()
sys.exit()`
  },
  {
    id: 'spaceinvaders',
    title: 'Galactic Defense 1978',
    genre: 'action',
    genreLabel: 'Acción & Disparos',
    year: 1978,
    players: '1P',
    rating: 4.9,
    highScore: 4920,
    accentColor: 'cyan',
    coverImage: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=600&q=80',
    previewVideo: 'https://assets.mixkit.co/videos/preview/mixkit-laser-lights-projecting-onto-a-surface-41484-large.mp4',
    tagline: 'Defiende la Tierra de la armada alienígena pixelada.',
    description: 'El clásico de cabina original de Tomohiro Nishikado. Pilota tu cañón láser terrestre tras barreras defensivas destructibles mientras oleadas de invasores alienígenas descienden aumentando el tempo cardíaco del arcade.',
    difficulty: 'Difícil',
    controls: [
      { key: '← / A', action: 'Mover Cañón Izquierda' },
      { key: '→ / D', action: 'Mover Cañón Derecha' },
      { key: 'ESPACIO', action: 'Disparar Láser' },
      { key: 'P', action: 'Pausa' }
    ],
    features: [
      'Formación alienígena con animación de pasos clásica',
      'Plataformas defensivas de escudo con desgaste por impactos',
      'Ovni misterioso nodriza que cruza en la parte superior (+150 pts)',
      'Audio arcade reactivo que se acelera con cada baja enemiga'
    ],
    pythonCode: `# ==========================================
# GALACTIC DEFENSE 1978 - ARCADE (PYGAME)
# Creado por Junior Sánchez
# ==========================================
import pygame
import random
import sys

pygame.init()
WIDTH, HEIGHT = 640, 600
BLACK = (5, 2, 10)
CYAN = (0, 240, 255)
GOLD = (255, 215, 0)
PURPLE = (168, 85, 247)
WHITE = (255, 255, 255)

screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Galactic Defense 1978 - Arcade Edition")
clock = pygame.time.Clock()

player_x = WIDTH // 2 - 20
player_y = HEIGHT - 50
player_speed = 6
bullets = []
enemy_bullets = []

# Crear invasores
ALIEN_ROWS = 4
ALIEN_COLS = 8
aliens = []
for r in range(ALIEN_ROWS):
    for c in range(ALIEN_COLS):
        aliens.append(pygame.Rect(60 + c * 60, 50 + r * 45, 32, 24))

alien_dx = 2
score = 0
lives = 3

running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        elif event.type == pygame.KEYDOWN:
            if event.key == pygame.K_SPACE and len(bullets) < 3:
                bullets.append(pygame.Rect(player_x + 18, player_y - 10, 4, 12))

    keys = pygame.key.get_pressed()
    if (keys[pygame.K_LEFT] or keys[pygame.K_a]) and player_x > 20:
        player_x -= player_speed
    if (keys[pygame.K_RIGHT] or keys[pygame.K_d]) and player_x < WIDTH - 60:
        player_x += player_speed

    # Mover proyectiles jugador
    for b in bullets[:]:
        b.y -= 9
        if b.y < 0:
            bullets.remove(b)

    # Mover armada alien
    shift_down = False
    for a in aliens:
        a.x += alien_dx
        if a.x <= 10 or a.x >= WIDTH - 45:
            shift_down = True

    if shift_down:
        alien_dx = -alien_dx
        for a in aliens:
            a.y += 18
            if a.y >= player_y - 20:
                print("ARMADA LLEGÓ A LA BASE - GAME OVER")
                running = False

    # Disparo de aliens aleatorio
    if random.random() < 0.03 and aliens and len(enemy_bullets) < 5:
        shooter = random.choice(aliens)
        enemy_bullets.append(pygame.Rect(shooter.centerx, shooter.bottom, 4, 10))

    # Mover proyectiles enemigos
    for eb in enemy_bullets[:]:
        eb.y += 5
        if eb.y > HEIGHT:
            enemy_bullets.remove(eb)
        elif eb.colliderect(pygame.Rect(player_x, player_y, 40, 20)):
            lives -= 1
            enemy_bullets.remove(eb)
            if lives <= 0:
                print("SIN VIDAS - GAME OVER")
                running = False

    # Colisiones bala jugador con alien
    for b in bullets[:]:
        for a in aliens[:]:
            if b.colliderect(a):
                aliens.remove(a)
                bullets.remove(b)
                score += 30
                break

    # Dibujado
    screen.fill(BLACK)
    # Jugador
    pygame.draw.rect(screen, CYAN, (player_x, player_y, 40, 20), border_radius=4)
    pygame.draw.rect(screen, CYAN, (player_x + 16, player_y - 8, 8, 8))

    # Balas
    for b in bullets:
        pygame.draw.rect(screen, GOLD, b)
    for eb in enemy_bullets:
        pygame.draw.rect(screen, PURPLE, eb)

    # Aliens
    for a in aliens:
        pygame.draw.rect(screen, PURPLE, a, border_radius=4)

    pygame.display.flip()
    clock.tick(60)

pygame.quit()
sys.exit()`
  }
];
